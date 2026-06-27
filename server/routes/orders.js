//订单相关接口（下单、支付、发货、收货、取消）
const express = require('express');
const router = express.Router();
const { orders, products, users, genId } = require('../data');

// 模拟支付（直接扭转状态到 paid）
function simulatePay(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order && order.status === 'pending') {
    order.status = 'paid';
    return true;
  }
  return false;
}

// 创建订单（买家点击“我想要”）
router.post('/', (req, res) => {
  const { productId } = req.body;
  // 模拟买家（实际 JWT）
  const buyerId = req.user ? req.user.id : 3;
  const buyer = users.find(u => u.id === buyerId);
  if (!buyer) return res.status(401).json({ message: '请先登录' });

  const product = products.find(p => p.id === productId && p.status === 'active');
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
    createdAt: new Date().toISOString()
  };
  orders.push(order);

  res.status(201).json({ order });
});

// 获取订单列表（支持按身份筛选）
router.get('/', (req, res) => {
  const userId = req.user ? req.user.id : 3;
  const { role, status, page = 1, limit = 10 } = req.query;

  let filtered = orders;
  if (role === 'buyer') {
    filtered = filtered.filter(o => o.buyerId === userId);
  } else if (role === 'seller') {
    filtered = filtered.filter(o => o.sellerId === userId);
  }
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({
    orders: items,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

// 获取单个订单详情
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  res.json({ order });
});

// 订单状态流转（模拟付款、发货、收货、取消）
router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: '订单不存在' });

  const validTransitions = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['received'],
    received: [],
    cancelled: []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({
      message: `不能从 ${order.status} 转为 ${status}`
    });
  }

  order.status = status;
  res.json({ order });
});

// 模拟付款（快捷操作，实际是状态流转）
router.post('/:id/pay', (req, res) => {
  const id = parseInt(req.params.id);
  if (!simulatePay(id)) {
    return res.status(400).json({ message: '支付失败，订单状态不允许' });
  }
  res.json({ message: '支付成功', order: orders.find(o => o.id === id) });
});

module.exports = router;
