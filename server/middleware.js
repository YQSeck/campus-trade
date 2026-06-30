// 【公共基础】JWT 鉴权、密码加密、账号规范化
// AI 生成：手动调整前请勿修改
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = 'campus-trade-secret-key';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      phone: user.phone || '',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);

    const dbUser = require('./db').db.users.find((u) => u.id === req.user.id);
    if (dbUser && dbUser.banned) {
      return res.status(403).json({ message: '账号已被封禁' });
    }

    next();
  } catch {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足，需要管理员身份' });
  }
  next();
}

function mockSendEmail(email, content) {
  console.log(`[邮件模拟] 发送至 ${email}: ${content}`);
}

function normalizeAccount(value) {
  if (value == null) return '';
  let v = String(value).trim().replace(/[\s\-()]/g, '');
  if (v.startsWith('+86')) {
    v = v.slice(3);
  } else if (/^86\d{11}$/.test(v)) {
    v = v.slice(2);
  }
  return v;
}

module.exports = {
  JWT_SECRET,
  MAX_LOGIN_ATTEMPTS,
  LOCK_DURATION_MS,
  hashPassword,
  generateToken,
  authMiddleware,
  adminMiddleware,
  mockSendEmail,
  normalizeAccount,
};
