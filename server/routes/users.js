const express = require('express');
const { db } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware');

const router = express.Router();

router.get('/:id/reputation', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const userReviews = db.reviews.filter((r) => {
    const order = db.orders.find((o) => o.id === r.orderId);
    return order && order.sellerId === userId;
  });

  res.json({
    userId,
    reputationScore: user.reputationScore,
    reviewCount: userReviews.length,
  });
});

router.put('/:id/ban', authMiddleware, adminMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: '用户不存在' });
  if (user.role === 'admin') return res.status(400).json({ message: '不能封禁管理员账号' });
  user.banned = true;
  res.json({ message: '用户已封禁', userId: user.id, nickname: user.nickname });
});

router.put('/:id/unban', authMiddleware, adminMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: '用户不存在' });
  user.banned = false;
  user.lockedUntil = null;
  res.json({ message: '用户已解封', userId: user.id, nickname: user.nickname });
});

router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const list = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    nickname: u.nickname,
    banned: u.banned,
    createdAt: u.createdAt,
  }));
  const total = list.length;
  const start = (page - 1) * limit;
  res.json({ users: list.slice(start, start + limit), total, page, limit });
});

module.exports = router;
