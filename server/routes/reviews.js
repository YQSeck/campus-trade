// AI 生成，手动调整：支持卖家评价买家、7天评价窗口、review 列表过滤隐藏/删除

const express = require('express');
const { db, genId } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

function updateReputation(userId) {
  const userReviews = db.reviews.filter((r) => {
    if (r.deleted || r.hidden) return false;
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

router.post('/', authMiddleware, (req, res) => {
  const { orderId, rating, content } = req.body;
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  if (order.status !== 'received') {
    return res.status(400).json({ message: '只能评价已完成的订单' });
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const orderCompletedAt = new Date(order.createdAt).getTime() + sevenDaysMs;
  if (Date.now() > orderCompletedAt + sevenDaysMs) {
    return res.status(400).json({ message: '已超过7天评价窗口' });
  }

  const reviewerId = req.user.id;
  const isSeller = reviewerId === order.sellerId;
  const isBuyer = reviewerId === order.buyerId;

  if (!isBuyer && !isSeller) {
    return res.status(403).json({ message: '只有买卖双方可以评价' });
  }

  const revieweeType = isBuyer ? 'seller' : 'buyer';
  const existing = db.reviews.find((r) => r.orderId === orderId && r.reviewerId === reviewerId);
  if (existing) return res.status(400).json({ message: '您已评价过该订单' });

  if (isSeller && content) {
    return res.status(400).json({ message: '卖家只能进行星级评价，不可填写文字' });
  }

  if (isBuyer && (!rating || !content)) {
    return res.status(400).json({ message: '买家评价需要星级和文字内容' });
  }

  const review = {
    id: genId('review'),
    orderId,
    rating: Math.min(5, Math.max(1, rating || 3)),
    content: content || '',
    reviewerId,
    revieweeType,
    hidden: false,
    deleted: false,
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);

  if (revieweeType === 'seller') {
    updateReputation(order.sellerId);
  }

  res.status(201).json({ review });
});

router.get('/', (req, res) => {
  let items = db.reviews.map((r) => {
    const order = db.orders.find((o) => o.id === r.orderId);
    const reviewer = db.users.find((u) => u.id === r.reviewerId);
    return {
      ...r,
      reviewerNickname: reviewer ? reviewer.nickname : '未知',
      orderTitle: order ? order.productTitle : '未知',
    };
  });

  const adminToken = req.query._admin;
  if (adminToken) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware');
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      if (decoded.role !== 'admin') {
        items = items.filter((r) => !r.hidden && !r.deleted);
      }
    } catch {
      items = items.filter((r) => !r.hidden && !r.deleted);
    }
  } else {
    items = items.filter((r) => !r.hidden && !r.deleted);
  }

  res.json({ reviews: items, total: items.length });
});

module.exports = router;
