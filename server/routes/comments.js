//商品留言接口
const express = require('express');
const router = express.Router();
const { comments, products, users, genId } = require('../data');

router.get('/products/:productId/comments', (req, res) => {
  const productId = parseInt(req.params.productId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const list = comments.filter(c => c.productId === productId);
  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  res.json({
    comments: items,
    total,
    page,
    limit
  });
});

// 发布留言
router.post('/products/:productId/comments', (req, res) => {
  const productId = parseInt(req.params.productId);
  const { content } = req.body;
  // 模拟当前用户（实际从 JWT 解析）
  const userId = req.user ? req.user.id : 3;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ message: '请先登录' });

  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });

  const comment = {
    id: genId('comment'),
    productId,
    userId: user.id,
    userNickname: user.nickname,
    content,
    createdAt: new Date().toISOString()
  };
  comments.push(comment);
  res.status(201).json({ comment });
});

module.exports = router;
