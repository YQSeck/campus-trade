// AI 生成，手动调整：分离 ban/unban 端点、评价逻辑删除、评价隐藏、stats 清理

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

router.put('/users/:id/ban', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  user.banned = true;
  user.lockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  res.json({ message: '封禁成功', userId: user.id, nickname: user.nickname });
});

router.put('/users/:id/unban', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  user.banned = false;
  user.lockedUntil = null;
  res.json({ message: '解封成功', userId: user.id, nickname: user.nickname });
});

router.put('/users/:id/reset-password', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  const newPwd = Math.random().toString(36).slice(-8);
  user.password = hashPassword(newPwd);
  user.loginAttempts = 0;
  user.lockedUntil = null;
  mockSendEmail(user.email || user.phone, `管理员已重置密码，新密码：${newPwd}`);
  res.json({ message: '密码已重置' });
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

router.put('/reviews/:id/hide', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) return res.status(404).json({ message: '评价不存在' });
  review.hidden = true;
  res.json({ message: '评价已隐藏', review });
});

router.delete('/reviews/:id', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) return res.status(404).json({ message: '评价不存在' });
  review.deleted = true;
  res.json({ message: '评价已删除' });
});

module.exports = router;
