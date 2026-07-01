// 【模块一：用户系统】注册、登录、忘记密码、个人信息、密码修改
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db, genId } = require('../db');
const {
  hashPassword,
  generateToken,
  authMiddleware,
  mockSendEmail,
  MAX_LOGIN_ATTEMPTS,
  LOCK_DURATION_MS,
  normalizeAccount,
} = require('../middleware');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, nickname, school, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: '邮箱和手机号至少填写一项' });
  }
  if (!password || !nickname || !school) {
    return res.status(400).json({ message: '缺少必填字段：昵称、学校、密码为必填项' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于6位' });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入正确的邮箱格式' });
    }
    if (db.users.find((u) => u.email === email)) {
      return res.status(409).json({ message: '该邮箱已被注册' });
    }
  }

  if (phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: '请输入正确的手机号格式' });
    }
    if (db.users.find((u) => u.phone === phone)) {
      return res.status(409).json({ message: '该手机号已被注册' });
    }
  }

  const newUser = {
    id: genId('user'),
    email: email || '',
    phone: phone || '',
    password: hashPassword(password),
    nickname,
    school,
    avatarUrl: '',
    contact: '',
    contactVisible: true,
    role: 'user',
    reputationScore: 100,
    banned: false,
    lockedUntil: null,
    loginAttempts: 0,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  res.status(201).json({ message: '注册成功', userId: newUser.id });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  const account = normalizeAccount(req.body.email);

  if (!account || !password) {
    return res.status(400).json({ message: '请输入邮箱/手机号和密码' });
  }

  const isEmailAccount = account.includes('@');
  const user = db.users.find((u) => (isEmailAccount ? u.email === account : u.phone === account));
  if (!user) {
    return res.status(401).json({ message: '邮箱/手机号或密码错误' });
  }

  if (user.banned) {
    return res.status(403).json({ message: '账号已被封禁' });
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    return res.status(403).json({ message: `账号已被锁定，请 ${remaining} 分钟后再试` });
  }

  if (user.password !== hashPassword(password)) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
      user.loginAttempts = 0;
      return res.status(403).json({ message: '密码错误次数过多，账号已被锁定15分钟' });
    }
    const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
    return res.status(401).json({ message: `邮箱/手机号或密码错误，还剩 ${remaining} 次尝试机会` });
  }

  user.loginAttempts = 0;
  user.lockedUntil = null;

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone || '',
      nickname: user.nickname,
      school: user.school,
      avatarUrl: user.avatarUrl,
      contact: user.contact,
      contactVisible: user.contactVisible,
      role: user.role,
      reputationScore: user.reputationScore,
    },
  });
});

// ========== 验证码存储（模块一：忘记密码） ==========
const resetCodes = new Map();

router.post('/forgot-password', (req, res) => {
  const account = normalizeAccount(req.body.email);

  if (!account) {
    return res.status(400).json({ message: '请输入邮箱或手机号' });
  }

  const isEmailAccount = account.includes('@');
  const user = db.users.find((u) => (isEmailAccount ? u.email === account : u.phone === account));
  if (!user) {
    return res.status(404).json({ message: '该账号未注册' });
  }

  // 生成6位数字验证码，10分钟有效
  const code = String(Math.floor(100000 + Math.random() * 900000));
  resetCodes.set(account, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

  const target = user.email || user.phone;
  mockSendEmail(target, `您的验证码是 ${code}（10分钟内有效）`);
  console.log(`[忘记密码] ${target} 的验证码: ${code}`);

  res.json({ message: '验证码已发送至邮箱/手机，请在10分钟内完成验证' });
});

router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: '请填写完整信息（邮箱、验证码、新密码）' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: '新密码长度不能少于6位' });
  }

  const account = normalizeAccount(email);
  const stored = resetCodes.get(account);

  // 校验验证码
  if (!stored) {
    return res.status(400).json({ message: '未发送验证码或验证码已失效，请重新获取' });
  }
  if (Date.now() > stored.expiresAt) {
    resetCodes.delete(account);
    return res.status(400).json({ message: '验证码已过期（有效期为10分钟），请重新获取' });
  }
  if (stored.code !== code) {
    return res.status(400).json({ message: '验证码错误' });
  }

  // 验证通过，更新密码
  const isEmailAccount = account.includes('@');
  const user = db.users.find((u) => (isEmailAccount ? u.email === account : u.phone === account));
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  user.password = hashPassword(newPassword);
  user.loginAttempts = 0;
  user.lockedUntil = null;
  resetCodes.delete(account);

  res.json({ message: '密码重置成功，请使用新密码登录' });
});

const userRoutes = express.Router();

function publicUserFields(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone || '',
    nickname: user.nickname,
    school: user.school,
    avatarUrl: user.avatarUrl,
    contact: user.contactVisible ? user.contact : '',
    contactVisible: user.contactVisible,
    role: user.role,
    reputationScore: user.reputationScore,
  };
}

userRoutes.get('/profile', authMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  res.json({ user: publicUserFields(user) });
});

userRoutes.put('/profile', authMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const { nickname, school, avatarUrl, contact, phone, email, contactVisible } = req.body;
  if (nickname !== undefined) user.nickname = nickname;
  if (school !== undefined) user.school = school;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (contact !== undefined) user.contact = contact;
  if (phone !== undefined) user.phone = phone;
  if (email !== undefined) user.email = email;
  if (contactVisible !== undefined) user.contactVisible = !!contactVisible;

  res.json({ user: publicUserFields(user) });
});

userRoutes.put('/password', authMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '请输入当前密码和新密码' });
  }
  if (user.password !== hashPassword(oldPassword)) {
    return res.status(400).json({ message: '当前密码错误' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: '新密码长度不能少于6位' });
  }

  user.password = hashPassword(newPassword);
  res.json({ message: '密码修改成功' });
});

const uploadRouter = express.Router();
uploadRouter.post('/', authMiddleware, (req, res) => {
  const randomId = Math.random().toString(36).slice(2, 10);
  const avatarUrl = `/uploads/avatar_${randomId}.jpg`;
  console.log(`[上传模拟] 用户 ${req.user.id} 上传头像: ${avatarUrl}`);
  res.json({ url: avatarUrl });
});

module.exports = { authRouter: router, userRouter: userRoutes, uploadRouter, authMiddleware };
