// 【模块三：交易与订单】下单、支付、发货、收货
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db, genId, enrichOrder } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

function normalizeStatusFilter(status) {
  if (status === 'completed') return 'received';
  return status;
}

router.post('/', authMiddleware, (req, res) => {
  const { productId } = req.body;
  const buyerId = req.user.id;
  const buyer = db.users.find((u) => u.id === buyerId);
  if (!buyer) return res.status(401).json({ message: '请先登录' });

  const product = db.products.find((p) => p.id === productId && p.status === 'active');
  if (!product) return res.status(404).json({ message: '商品不存在或已下架' });
  if (product.sellerId === buyerId) return res.status(400).json({ message: '不能购买自己的商品' });

  const order = {
    id: genId('order'),
    productId: product.id,
    productTitle: product.title,
    buyerId: buyer.id,
    sellerId: product.sellerId,
    price: product.price,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);

  res.status(201).json({ order: enrichOrder(order) });
});

router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { role, status, page = 1, limit = 10 } = req.query;
  const statusFilter = status ? normalizeStatusFilter(status) : '';

  let filtered = db.orders;
  if (req.user.role === 'admin' && !role) {
    filtered = db.orders;
  } else if (role === 'buyer') {
    filtered = filtered.filter((o) => o.buyerId === userId);
  } else if (role === 'seller') {
    filtered = filtered.filter((o) => o.sellerId === userId);
  } else if (req.user.role !== 'admin') {
    filtered = filtered.filter((o) => o.buyerId === userId || o.sellerId === userId);
  }

  if (statusFilter) {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + parseInt(limit)).map(enrichOrder);

  res.json({ orders: items, total, page: parseInt(page), limit: parseInt(limit) });
});

router.get('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: '订单不存在' });

  if (
    req.user.role !== 'admin' &&
    order.buyerId !== req.user.id &&
    order.sellerId !== req.user.id
  ) {
    return res.status(403).json({ message: '无权查看该订单' });
  }

  res.json({ order: enrichOrder(order) });
});

router.put('/:id/status', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: '订单不存在' });

  const validTransitions = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['received'],
    received: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({ message: `不能从 ${order.status} 转为 ${status}` });
  }

  order.status = status;
  res.json({ order: enrichOrder(order) });
});

router.post('/:id/pay', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该订单' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ message: '支付失败，订单状态不允许' });
  }

  order.status = 'paid';
  res.json({ message: '支付成功', order: enrichOrder(order) });
});

module.exports = router;
