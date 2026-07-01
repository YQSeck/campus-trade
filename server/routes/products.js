// 【模块二：商品发布与管理】商品 CRUD、搜索筛选
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const { page = 1, limit = 10, search, category, priceOrder, minPrice, maxPrice, status, mine } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filtered = [...db.products];

  if (mine && req.headers.authorization) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      filtered = filtered.filter((p) => p.sellerId === decoded.id);
    } catch {
      return res.status(401).json({ message: '登录已过期，请重新登录' });
    }
  } else if (mine) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  } else if (!mine) {
    filtered = filtered.filter((p) => p.status === 'active');
  }

  if (search) {
    const kw = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    );
  }

  if (category) {
    const cats = category.split(',');
    filtered = filtered.filter((p) => cats.includes(p.category));
  }

  if (minPrice !== undefined && minPrice !== '') {
    filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
  }

  if (priceOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const pagedProducts = filtered.slice(start, start + limitNum);

  res.json({ products: pagedProducts, total, page: pageNum, limit: limitNum });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: '商品不存在或已删除' });
  }

  const seller = db.users.find((u) => u.id === product.sellerId);
  const productComments = db.comments.filter((c) => c.productId === id);
  const productView = {
    ...product,
    sellerContact: seller && seller.contactVisible ? seller.contact : '',
  };

  res.json({ product: productView, comments: productComments });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, description, category, price, originalPrice, condition, images } = req.body;
  if (!title || !description || !category || price == null) {
    return res.status(400).json({ message: '标题、描述、分类、价格为必填项' });
  }

  const sellerId = req.user.id;
  const seller = db.users.find((u) => u.id === sellerId);

  const newProduct = {
    id: Math.max(...db.products.map((p) => p.id), 0) + 1,
    title,
    description,
    category,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    condition: condition || 9,
    images: images || [],
    sellerId,
    sellerNickname: seller ? seller.nickname : `用户${sellerId}`,
    sellerSchool: seller ? seller.school : '',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  db.products.push(newProduct);
  res.status(201).json({ product: newProduct });
});

router.put('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该商品' });
  }

  const { title, description, category, price, originalPrice, condition, images, status } = req.body;

  if (status) {
    if (!['active', 'removed'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    product.status = status;
  } else {
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = parseFloat(originalPrice);
    if (condition !== undefined) product.condition = condition;
    if (images !== undefined) product.images = images;
  }
  res.json({ product });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: '商品不存在' });
  if (db.products[idx].sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该商品' });
  }
  // 物理删除：从数组中移除，清理关联的留言
  db.comments = db.comments.filter((c) => c.productId !== id);
  db.products.splice(idx, 1);
  res.json({ message: '商品已删除' });
});

module.exports = router;
