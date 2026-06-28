// 【模块五：后台管理】统计、审核、用户管理、举报、评价管理
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db } = require('../db');
const { authMiddleware, adminMiddleware, hashPassword, mockSendEmail } = require('../middleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', (req, res) => {
  const productCount = db.products.filter((p) => p.status !== 'deleted').length;
  const orderCount = db.orders.length;
  const userCount = db.users.length;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = db.orders.filter((o) => new Date(o.createdAt) >= weekAgo).length;
  const weeklyVolume = db.orders
    .filter((o) => new Date(o.createdAt) >= weekAgo && o.status === 'received')
    .reduce((sum, o) => sum + o.price, 0);

  const dailyVolume = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const volume = db.orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString() && o.status === 'received';
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
    totalProducts: productCount,
    totalOrders: orderCount,
    totalUsers: userCount,
    recentOrders,
  });
});

router.get('/products', (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const items = db.products.filter((p) => p.status !== 'deleted');
  const total = items.length;
  const paged = items.slice((page - 1) * limit, page * limit);
  res.json({ products: paged, total, page, limit });
});

router.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { status } = req.body;
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  if (status) product.status = status;
  res.json({ message: '操作成功', product });
});

router.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  product.status = 'deleted';
  res.json({ message: '商品已删除' });
});

router.get('/users', (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const items = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    role: u.role,
    lockedUntil: u.lockedUntil,
    banned: u.banned,
    reputationScore: u.reputationScore,
  }));
  const total = items.length;
  res.json({ users: items.slice((page - 1) * limit, page * limit), total, page, limit });
});

router.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { action } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  switch (action) {
    case 'ban':
      user.banned = true;
      user.lockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case 'unban':
      user.banned = false;
      user.lockedUntil = null;
      break;
    case 'reset_password': {
      const newPwd = Math.random().toString(36).slice(-8);
      user.password = hashPassword(newPwd);
      user.loginAttempts = 0;
      user.lockedUntil = null;
      mockSendEmail(user.email || user.phone, `管理员已重置密码，新密码：${newPwd}`);
      break;
    }
    default:
      return res.status(400).json({ message: '无效操作' });
  }
  res.json({ message: '操作成功', user });
});

router.get('/reports', (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const total = db.reports.length;
  const items = db.reports.slice((page - 1) * limit, page * limit);
  res.json({ reports: items, total, page, limit });
});

router.put('/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const { status } = req.body;
  const report = db.reports.find((r) => r.id === reportId);
  if (!report) return res.status(404).json({ message: '举报不存在' });
  if (status !== 'resolved' && status !== 'dismissed') {
    return res.status(400).json({ message: '无效状态' });
  }
  report.status = status;
  res.json({ message: '处理成功', report });
});

router.get('/reviews', (req, res) => {
  const items = db.reviews.map((r) => {
    const order = db.orders.find((o) => o.id === r.orderId);
    const reviewer = db.users.find((u) => u.id === r.reviewerId);
    return {
      ...r,
      reviewerNickname: reviewer ? reviewer.nickname : '未知',
      orderTitle: order ? order.productTitle : '未知',
    };
  });
  res.json({ reviews: items, total: items.length });
});

router.delete('/reviews/:id', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const idx = db.reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) return res.status(404).json({ message: '评价不存在' });
  const review = db.reviews[idx];
  db.reviews.splice(idx, 1);
  const order = db.orders.find((o) => o.id === review.orderId);
  if (order) {
    const seller = db.users.find((u) => u.id === order.sellerId);
    if (seller) {
      const remaining = db.reviews.filter((r) => {
        const o = db.orders.find((ord) => ord.id === r.orderId);
        return o && o.sellerId === seller.id;
      });
      if (remaining.length === 0) {
        seller.reputationScore = 100;
      } else {
        const avg = remaining.reduce((s, r) => s + r.rating, 0) / remaining.length;
        seller.reputationScore = Math.round(avg * 20);
      }
    }
  }
  res.json({ message: '评价已删除' });
});

module.exports = router;
