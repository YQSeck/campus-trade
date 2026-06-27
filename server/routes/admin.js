// AI 生成，手动调整：管理员路由，包含权限中间件、统计、商品审核、用户管理、举报处理
const express = require('express');
const router = express.Router();

// ---------- 临时权限中间件 ----------
const authAdmin = (req, res, next) => {
  // 简化版：从请求头读取 token 并解析（实际应验证 JWT）
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未登录' });
  }
  try {
    // 这里模拟解析：假设 token 是 base64 编码的 user 对象 JSON
    const user = JSON.parse(Buffer.from(token, 'base64').toString());
    if (user.role !== 'admin') {
      return res.status(403).json({ message: '无权限' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: '无效token' });
  }
};

// ---------- Mock 数据 ----------
// 为了管理功能，直接引用 products 数组？但由于跨模块，我们在此处定义一份独立管理数据（实际项目会共享）
const adminProducts = [
  // 把商品数据复制一份（实际应共享），为演示状态变化，包含部分 removed 商品
  { id: 1, title: '二手笔记本', status: 'active', sellerId: 101, sellerNickname: '小明', createdAt: '2026-06-20T10:30:00.000Z' },
  { id: 2, title: '高等数学（第七版）', status: 'active', sellerId: 102, sellerNickname: '小红', createdAt: '2026-06-21T08:00:00.000Z' },
  { id: 3, title: '宿舍用小冰箱', status: 'active', sellerId: 103, sellerNickname: '张三', createdAt: '2026-06-18T14:20:00.000Z' },
  { id: 4, title: '机械键盘（青轴）', status: 'active', sellerId: 101, sellerNickname: '小明', createdAt: '2026-06-22T11:10:00.000Z' },
  { id: 5, title: '折叠书桌', status: 'active', sellerId: 104, sellerNickname: '李四', createdAt: '2026-06-19T16:45:00.000Z' },
  { id: 9, title: '已下架测试商品', status: 'removed', sellerId: 101, sellerNickname: '小明', createdAt: '2026-06-20T10:00:00.000Z' },
];

const adminUsers = [
  { id: 1, email: 'admin@test.com', nickname: '管理员', role: 'admin', lockedUntil: null, reputationScore: 100 },
  { id: 2, email: 'user1@test.com', nickname: '小明', role: 'user', lockedUntil: null, reputationScore: 85 },
  { id: 3, email: 'user2@test.com', nickname: '小红', role: 'user', lockedUntil: '2026-07-10T00:00:00.000Z', reputationScore: 60 },
  { id: 4, email: 'user3@test.com', nickname: '张三', role: 'user', lockedUntil: null, reputationScore: 92 },
  { id: 5, email: 'user4@test.com', nickname: '李四', role: 'user', lockedUntil: null, reputationScore: 70 },
];

const reports = [
  { id: 1, targetType: 'product', targetId: 1, reason: '疑似假货', reporterId: 2, status: 'pending', createdAt: '2026-06-24T09:00:00.000Z' },
  { id: 2, targetType: 'product', targetId: 3, reason: '商品与描述不符', reporterId: 3, status: 'pending', createdAt: '2026-06-24T10:30:00.000Z' },
  { id: 3, targetType: 'user', targetId: 2, reason: '恶意骚扰', reporterId: 4, status: 'resolved', createdAt: '2026-06-25T11:00:00.000Z' },
  { id: 4, targetType: 'product', targetId: 5, reason: '疑似违禁品', reporterId: 5, status: 'dismissed', createdAt: '2026-06-26T08:20:00.000Z' },
];

// 模拟订单数据用于统计
const orders = [
  { id: 1, price: 2800, status: 'received', createdAt: '2026-06-20T12:00:00.000Z' },
  { id: 2, price: 150, status: 'shipped', createdAt: '2026-06-21T14:00:00.000Z' },
  { id: 3, price: 299, status: 'received', createdAt: '2026-06-22T16:00:00.000Z' },
  { id: 4, price: 120, status: 'paid', createdAt: '2026-06-23T10:00:00.000Z' },
  { id: 5, price: 45, status: 'received', createdAt: '2026-06-24T08:00:00.000Z' },
  { id: 6, price: 350, status: 'pending', createdAt: '2026-06-25T09:00:00.000Z' },
  { id: 7, price: 15, status: 'received', createdAt: '2026-06-26T11:00:00.000Z' },
  { id: 8, price: 50, status: 'cancelled', createdAt: '2026-06-26T12:00:00.000Z' },
];

// ---------- 统计接口 ----------
router.get('/stats', authAdmin, (req, res) => {
  const productCount = adminProducts.length;
  const orderCount = orders.length;
  const userCount = adminUsers.length;
  const weeklyVolume = orders.reduce((sum, o) => sum + o.price, 0);

  // 生成最近7天交易额模拟数据
  const dailyVolume = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const volume = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      })
      .reduce((s, o) => s + o.price, 0);
    dailyVolume.push({ date: dateStr, volume });
  }

  res.json({
    productCount,
    orderCount,
    userCount,
    weeklyVolume,
    dailyVolume,
  });
});

// ---------- 商品审核（获取所有商品列表） ----------
router.get('/products', authAdmin, (req, res) => {
  // 支持分页，简单实现
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const total = adminProducts.length;
  const items = adminProducts.slice((page - 1) * limit, page * limit);
  res.json({ products: items, total, page, limit });
});

// 修改商品状态（下架/上架）或删除
router.put('/products/:id', authAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;
  const product = adminProducts.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  if (status) {
    product.status = status; // 'active' 或 'removed'
  }
  res.json({ message: '操作成功', product });
});

router.delete('/products/:id', authAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  const index = adminProducts.findIndex((p) => p.id === productId);
  if (index === -1) return res.status(404).json({ message: '商品不存在' });
  adminProducts.splice(index, 1);
  res.json({ message: '商品已删除' });
});

// ---------- 用户管理 ----------
router.get('/users', authAdmin, (req, res) => {
  // 支持分页
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const total = adminUsers.length;
  const items = adminUsers.slice((page - 1) * limit, page * limit);
  res.json({ users: items, total, page, limit });
});

router.put('/users/:id', authAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const { action } = req.body;
  const user = adminUsers.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  switch (action) {
    case 'ban':
      user.lockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 封禁7天
      break;
    case 'unban':
      user.lockedUntil = null;
      break;
    case 'reset_password':
      // 模拟重置密码，实际应发送邮件或返回新密码
      break;
    default:
      return res.status(400).json({ message: '无效操作' });
  }
  res.json({ message: '操作成功', user });
});

// ---------- 举报处理 ----------
router.get('/reports', authAdmin, (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const total = reports.length;
  const items = reports.slice((page - 1) * limit, page * limit);
  res.json({ reports: items, total, page, limit });
});

router.put('/reports/:id', authAdmin, (req, res) => {
  const reportId = parseInt(req.params.id);
  const { status } = req.body;
  const report = reports.find((r) => r.id === reportId);
  if (!report) return res.status(404).json({ message: '举报不存在' });
  if (status !== 'resolved' && status !== 'dismissed') {
    return res.status(400).json({ message: '无效状态' });
  }
  report.status = status;
  res.json({ message: '处理成功', report });
});

module.exports = router;
