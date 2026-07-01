// 【公共基础】JWT 鉴权、密码加密、账号规范化
// AI 生成：手动调整：bcrypt 替换 SHA256、两级锁定机制、apiKeyMiddleware 保留 origin+host 白名单
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'campus-trade-secret-key';
const MAX_LOGIN_ATTEMPTS_TIER1 = 5;
const MAX_LOGIN_ATTEMPTS_TIER2 = 10;
const LOCK_DURATION_30MIN = 30 * 60 * 1000;
const LOCK_DURATION_24HR = 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;
const PUBLIC_API_KEY = 'campus-trade-2026-public';

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
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
  let v = String(value)
    .trim()
    .replace(/[\s\-()]/g, '');
  if (v.startsWith('+86')) {
    v = v.slice(3);
  } else if (/^86\d{11}$/.test(v)) {
    v = v.slice(2);
  }
  return v;
}

// ========== 模块六：开放 API 第三方鉴权 ==========
// 保留 origin + host 双重白名单（确保前端页面 + Vite 代理都能正常访问）
function apiKeyMiddleware(req, res, next) {
  // 只对 GET 请求进行校验，POST/PUT/DELETE 由 JWT 接管
  if (req.method !== 'GET') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const origin = req.headers.origin;
  const host = req.headers.host || '';

  // 有 origin 且来自 localhost：放行（浏览器页面请求）
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return next();
  }

  // 没有 origin 但 host 是 localhost：放行（Vite 代理或其他本地请求）
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
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
  PUBLIC_API_KEY,
  MAX_LOGIN_ATTEMPTS_TIER1,
  MAX_LOGIN_ATTEMPTS_TIER2,
  LOCK_DURATION_30MIN,
  LOCK_DURATION_24HR,
  SALT_ROUNDS,
  hashPassword,
  comparePassword,
  generateToken,
  authMiddleware,
  adminMiddleware,
  mockSendEmail,
  normalizeAccount,
  apiKeyMiddleware,
};
