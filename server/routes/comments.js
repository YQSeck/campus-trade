// 【模块三：交易与订单】商品留言与卖家回复
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db, genId } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

router.get('/:productId/comments', (req, res) => {
  const productId = parseInt(req.params.productId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const list = db.comments.filter((c) => c.productId === productId);
  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  res.json({ comments: items, total, page, limit });
});

router.post('/:productId/comments', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId);
  const { content, parentId } = req.body;
  const userId = req.user.id;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: '请先登录' });

  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });

  if (parentId) {
    const parent = db.comments.find((c) => c.id === parentId && c.productId === productId);
    if (!parent) return res.status(404).json({ message: '回复的留言不存在' });
  }

  const comment = {
    id: genId('comment'),
    productId,
    userId: user.id,
    userNickname: user.nickname,
    content,
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  res.status(201).json({ comment });
});

module.exports = router;
