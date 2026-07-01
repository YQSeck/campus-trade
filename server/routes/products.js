// 【模块二：商品发布与管理】商品 CRUD、搜索筛选
// AI 生成，手动调整：加权搜索、keyword/sort 参数、admin 禁发商品、集中式 genId、物理删除保留

const express = require('express');
const { db, genId } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const {
    page = 1,
    limit = 10,
    keyword,
    search,           // 兼容旧版参数名
    category,
    sort,
    priceOrder,       // 兼容旧版参数名
    minPrice,
    maxPrice,
    status,
    mine,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filtered = [...db.products];

  // ---------- 鉴权 ----------
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

  // ---------- 状态筛选 ----------
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  } else if (!mine) {
    filtered = filtered.filter((p) => p.status === 'active');
  }

  // ---------- 关键词搜索（支持 keyword 和 search 参数，加权搜索） ----------
  const kw = keyword || search;
  if (kw) {
    const searchKw = kw.toLowerCase();
    filtered = filtered
      .map((p) => {
        const titleMatches = (p.title.toLowerCase().match(new RegExp(searchKw, 'g')) || []).length;
        const descMatches = (p.description.toLowerCase().match(new RegExp(searchKw, 'g')) || []).length;
        const score = titleMatches * 2 + descMatches * 1;
        return { ...p, _score: score };
      })
      .filter((p) => p._score > 0);
  }

  // ---------- 分类筛选 ----------
  if (category) {
    const cats = category.split(',');
    filtered = filtered.filter((p) => cats.includes(p.category));
  }

  // ---------- 价格区间 ----------
  if (minPrice !== undefined && minPrice !== '') {
    filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
  }

  // ---------- 排序（支持 sort 和 priceOrder 参数） ----------
  const sortKey = sort || priceOrder;
  if (sortKey === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortKey === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortKey === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortKey === 'popular') {
    filtered.sort((a, b) => a.condition - b.condition);
  } else if (sortKey === 'asc') {
    // 兼容旧版 priceOrder=asc
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortKey === 'desc') {
    // 兼容旧版 priceOrder=desc
    filtered.sort((a, b) => b.price - a.price);
  } else if (kw) {
    // 有关键词时默认按相关性排序
    filtered.sort((a, b) => b._score - a._score);
  }

  // ---------- 分页 ----------
  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const pagedProducts = filtered.slice(start, start + limitNum);

  // 移除临时 _score 字段
  const cleanProducts = pagedProducts.map(({ _score, ...p }) => p);
  res.json({ products: cleanProducts, total, page: pageNum, limit: limitNum });
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
  // 管理员不可发布商品
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: '管理员不可发布商品' });
  }

  const { title, description, category, price, originalPrice, condition, images } = req.body;
  if (!title || !description || !category || price == null) {
    return res.status(400).json({ message: '标题、描述、分类、价格为必填项' });
  }

  const sellerId = req.user.id;
  const seller = db.users.find((u) => u.id === sellerId);

  const newProduct = {
    id: genId('product'),
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

  const { title, description, category, price, originalPrice, condition, images, status } =
    req.body;

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
