// AI 生成，手动调整：内存数组存储、分页搜索筛选、字段对齐 API.md
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// 预设商品数据（演示用）
const products = [
  {
    id: 1, title: '高等数学第七版（上下册）', description: '九成新，几乎没写过字，买来就翻了几页', category: '书籍',
    price: 35, originalPrice: 68, condition: 9, images: [],
    sellerId: 888, sellerNickname: '示例管理员', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-20T08:00:00.000Z',
  },
  {
    id: 2, title: '罗技 G304 无线鼠标', description: '用了半年，换了新鼠标出掉，功能完好', category: '电子产品',
    price: 89, originalPrice: 199, condition: 8, images: [],
    sellerId: 999, sellerNickname: '示例卖家A', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-21T10:30:00.000Z',
  },
  {
    id: 3, title: '宿舍用小台灯 LED', description: '可调光，USB充电，很新', category: '生活用品',
    price: 25, originalPrice: 45, condition: 9, images: [],
    sellerId: 999, sellerNickname: '示例卖家A', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-22T14:00:00.000Z',
  },
  {
    id: 4, title: '大学英语四级词汇书', description: '背了一半，后面全新', category: '书籍',
    price: 10, originalPrice: 35, condition: 7, images: [],
    sellerId: 888, sellerNickname: '示例管理员', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-23T09:00:00.000Z',
  },
  {
    id: 5, title: 'iPad Air 4 保护壳', description: '买错了型号，全新未拆封', category: '电子产品',
    price: 15, originalPrice: 39, condition: 10, images: [],
    sellerId: 999, sellerNickname: '示例卖家A', sellerSchool: '深圳大学', status: 'removed',
    createdAt: '2026-06-24T16:00:00.000Z',
  },
];

// ======================== 商品列表 ========================
// GET /api/products ?page,limit,search,category,priceOrder,status,mine
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search, category, priceOrder, status, mine } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filtered = [...products];

  // my publishings filter
  if (mine && req.headers.authorization) {
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'campus-trade-secret-key-2026');
      filtered = filtered.filter((p) => p.sellerId === decoded.id);
    } catch { /* ignore auth error in list */ }
  }

  // 按状态筛选（默认只显示在售的）
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  } else if (!mine) {
    filtered = filtered.filter((p) => p.status === 'active');
  }

  // 关键词搜索
  if (search) {
    const kw = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    );
  }

  // 按分类筛选
  if (category) {
    const cats = category.split(',');
    filtered = filtered.filter((p) => cats.includes(p.category));
  }

  // 按价格排序
  if (priceOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const pagedProducts = filtered.slice(start, start + limitNum);

  // 返回数据不包含 password 字段（seller 已是公开信息）
  res.json({
    products: pagedProducts,
    total,
    page: pageNum,
    limit: limitNum,
  });
});

// ======================== 商品详情 ========================
// GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: '商品不存在或已删除' });
  }

  res.json({
    product,
  });
});

// ======================== 发布商品 ========================
// POST /api/products
router.post('/', authMiddleware, (req, res) => {
  const { title, description, category, price, originalPrice, condition, images } = req.body;

  if (!title || !description || !category || price == null) {
    return res.status(400).json({ message: '标题、描述、分类、价格为必填项' });
  }

  // 从 users 中获取卖家信息（跨文件引用内存数据——生产环境需改为数据库查询）
  const sellerId = req.user.id;
  const sellerNickname = req.user.nickname || '用户' + sellerId;
  const sellerSchool = req.user.school || '';

  const newProduct = {
    id: Math.max(...products.map((p) => p.id), 0) + 1,
    title,
    description,
    category,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    condition: condition || 9,
    images: images || [],
    sellerId,
    sellerNickname,
    sellerSchool,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);

  res.status(201).json({ product: newProduct });
});

// ======================== 编辑/下架/删除 ========================
// PUT /api/products/:id
router.put('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: '商品不存在' });
  }
  if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该商品' });
  }

  const { title, description, category, price, originalPrice, condition, images, status } = req.body;

  // 判断是编辑还是状态变更
  if (status) {
    // 只变更状态（下架、重新上架）
    if (!['active', 'removed'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    product.status = status;
  } else {
    // 编辑商品信息
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

// ======================== 删除商品 ========================
// DELETE /api/products/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ message: '商品不存在' });
  }
  if (products[idx].sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该商品' });
  }

  products[idx].status = 'deleted';
  res.json({ message: '商品已删除' });
});

module.exports = router;
