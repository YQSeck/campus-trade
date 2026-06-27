//交易评价与信誉分更新
const express = require('express');
const router = express.Router();
const { orders, reviews, users, genId } = require('../data');

// 更新用户信誉分（简单平均分）
function updateReputation(userId) {
  const userReviews = reviews.filter(r => {
    const order = orders.find(o => o.id === r.orderId);
    return order && order.sellerId === userId;
  });
  if (userReviews.length === 0) return;
  const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.reputationScore = Math.round(avg * 20); 
  }
}

// 为订单添加评价
router.post('/orders/:id/review', (req, res) => {
  const orderId = parseInt(req.params.id);
  const { rating, content } = req.body;
  const order = orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  if (order.status !== 'received') return res.status(400).json({ message: '只能评价已完成的订单' });
  
  // 模拟评价人（实际 JWT）
  const reviewerId = req.user ? req.user.id : 3;
  if (reviewerId !== order.buyerId) return res.status(403).json({ message: '只有买家可以评价' });

  const existing = reviews.find(r => r.orderId === orderId);
  if (existing) return res.status(400).json({ message: '该订单已评价' });

  const review = {
    id: genId('review'),
    orderId,
    rating: Math.min(5, Math.max(1, rating)),
    content: content || '',
    reviewerId,
    createdAt: new Date().toISOString()
  };
  reviews.push(review);

  // 更新卖家信誉分
  updateReputation(order.sellerId);

  res.status(201).json({ review });
});

// 获取用户的信誉分（或通过 user 接口）
router.get('/users/:id/reputation', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const userReviews = reviews.filter(r => {
    const order = orders.find(o => o.id === r.orderId);
    return order && order.sellerId === userId;
  });
  res.json({
    userId,
    reputationScore: user.reputationScore,
    reviewCount: userReviews.length
  });
});

module.exports = router;
