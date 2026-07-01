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

// ========== 模块六：开放 API 第三方鉴权 ==========
const PUBLIC_API_KEY = 'campus-trade-2026-public';

function apiKeyMiddleware(req, res, next) {
  // 只对 GET 请求进行第三方 API Key 校验，POST/PUT/DELETE 由 JWT 接管
  if (req.method !== 'GET') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const origin = req.headers.origin;
  const host = req.headers.host;

  // 同源请求（前端页面）直接放行
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('::1') || origin.includes('5173') || origin.includes('3000'))) {
    return next();
  }

  // 没有 origin 头时（如 Vite 代理转发），检查 host
  if (host && (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1'))) {
    return next();
  }

  // 第三方跨域调用必须有合法的 API Key
  if (apiKey === PUBLIC_API_KEY) {
    return next();
  }

  return res.status(401).json({ message: '无效或缺失 API Key，请携带 x-api-key 头调用' });
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
  apiKeyMiddleware,
};
