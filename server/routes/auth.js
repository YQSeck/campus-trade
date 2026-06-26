// AI 生成，手动调整：SHA256 密码加密、登录失败5次冻结15分钟、密码修改、头像上传 Mock
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const router = express.Router();

const JWT_SECRET = 'campus-trade-secret-key-2026';
const MAX_LOGIN_ATTEMPTS = 5; // 最大登录失败次数
const LOCK_DURATION_MS = 15 * 60 * 1000; // 冻结时长：15分钟

// SHA256 加密密码
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成 JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 认证中间件
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
}

// 模拟邮件发送
function mockSendEmail(email, newPassword) {
  console.log(`[邮件模拟] 发送至 ${email}: 您的新密码是 ${newPassword}`);
}

// ======== 内存用户存储（带密码加密和登录尝试字段）========
const users = [
  {
    id: 1,
    email: 'admin@szu.edu.cn',
    password: hashPassword('admin123'),
    nickname: '管理员',
    school: '深圳大学',
    avatarUrl: '',
    contact: '',
    role: 'admin',
    reputationScore: 100,
    lockedUntil: null,
    loginAttempts: 0, // 连续登录失败次数
  },
];

// ======================== 注册 ========================
router.post('/register', (req, res) => {
  const { email, password, nickname, school } = req.body;

  if (!email || !password || !nickname || !school) {
    return res.status(400).json({ message: '缺少必填字段：邮箱、昵称、学校、密码为必填项' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '密码长度不能少于6位' });
  }
  // 邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: '请输入正确的邮箱格式' });
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ message: '该邮箱已被注册' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password: hashPassword(password), // 密码加密存储
    nickname,
    school,
    avatarUrl: '',
    contact: '',
    role: 'user',
    reputationScore: 100,
    lockedUntil: null,
    loginAttempts: 0,
  };
  users.push(newUser);

  res.status(201).json({
    message: '注册成功',
    userId: newUser.id,
  });
});

// ======================== 登录 ========================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '请输入邮箱和密码' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: '邮箱或密码错误' });
  }

  // 检查账号是否被冻结
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    return res.status(403).json({
      message: `账号已被锁定，请 ${remaining} 分钟后再试`,
    });
  }

  // 验证密码（使用 SHA256 比对）
  if (user.password !== hashPassword(password)) {
    // 登录失败：增加尝试次数
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.loginAttempts = 0;
      return res.status(403).json({ message: '密码错误次数过多，账号已被锁定15分钟' });
    }
    const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
    return res.status(401).json({
      message: `邮箱或密码错误，还剩 ${remaining} 次尝试机会`,
    });
  }

  // 登录成功：重置尝试次数和解锁状态
  user.loginAttempts = 0;
  user.lockedUntil = null;

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      school: user.school,
      avatarUrl: user.avatarUrl,
      contact: user.contact,
      role: user.role,
      reputationScore: user.reputationScore,
    },
  });
});

// ======================== 忘记密码 ========================
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '请输入邮箱地址' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: '该邮箱未注册' });
  }

  const newPassword = Math.random().toString(36).slice(-8);
  user.password = hashPassword(newPassword); // 加密存储
  user.loginAttempts = 0; // 重置尝试次数
  user.lockedUntil = null;
  mockSendEmail(email, newPassword);

  res.json({ message: '新密码已发送至邮箱' });
});

// ======================== 用户个人信息 ========================
const userRoutes = express.Router();

// 获取个人信息
userRoutes.get('/profile', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      school: user.school,
      avatarUrl: user.avatarUrl,
      contact: user.contact,
      role: user.role,
      reputationScore: user.reputationScore,
    },
  });
});

// 更新个人信息
userRoutes.put('/profile', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const { nickname, school, avatarUrl, contact } = req.body;
  if (nickname !== undefined) user.nickname = nickname;
  if (school !== undefined) user.school = school;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (contact !== undefined) user.contact = contact;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      school: user.school,
      avatarUrl: user.avatarUrl,
      contact: user.contact,
      role: user.role,
      reputationScore: user.reputationScore,
    },
  });
});

// 修改密码
userRoutes.put('/password', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '请输入当前密码和新密码' });
  }

  // 验证旧密码
  if (user.password !== hashPassword(oldPassword)) {
    return res.status(400).json({ message: '当前密码错误' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: '新密码长度不能少于6位' });
  }

  user.password = hashPassword(newPassword);
  res.json({ message: '密码修改成功' });
});

// ======================== 头像上传（Mock）========================
const uploadRouter = express.Router();
uploadRouter.post('/', authMiddleware, (req, res) => {
  // 模拟上传：生成随机头像 URL
  const randomId = Math.random().toString(36).slice(2, 10);
  const avatarUrl = `/uploads/avatar_${randomId}.jpg`;
  console.log(`[上传模拟] 用户 ${req.user.id} 上传头像: ${avatarUrl}`);
  res.json({ url: avatarUrl });
});

module.exports = { authRouter: router, userRouter: userRoutes, uploadRouter, authMiddleware };
