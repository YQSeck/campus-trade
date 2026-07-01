// 【模块四：评价与信誉体系】订单评价与信誉分更新
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db, genId } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

function updateReputation(userId) {
  const userReviews = db.reviews.filter((r) => {
    const order = db.orders.find((o) => o.id === r.orderId);
    return order && order.sellerId === userId;
  });
  if (userReviews.length === 0) return;
  const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.reputationScore = Math.round(avg * 20);
  }
}

router.post('/:id/review', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  const { rating, content } = req.body;
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  if (order.status !== 'received') {
    return res.status(400).json({ message: '只能评价已完成的订单' });
  }

  const reviewerId = req.user.id;
  if (reviewerId !== order.buyerId) {
    return res.status(403).json({ message: '只有买家可以评价' });
  }

  const existing = db.reviews.find((r) => r.orderId === orderId);
  if (existing) return res.status(400).json({ message: '该订单已评价' });

  const review = {
    id: genId('review'),
    orderId,
    rating: Math.min(5, Math.max(1, rating)),
    content: content || '',
    reviewerId,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  updateReputation(order.sellerId);

  res.status(201).json({ review });
});

module.exports = router;
