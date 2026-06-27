// AI 合并版本：整合成员A（商品管理）与成员C（开放API、评论）的功能
const express = require('express');
const router = express.Router();

// ---------- Mock 数据 ----------
// 以成员C的丰富数据为基础，补全 sellerSchool 字段，并合并成员A的商品
const products = [
  {
    id: 1, title: '二手笔记本', description: '联想小新Pro14，九成新，使用一年，无维修', category: '电子产品',
    price: 2800, originalPrice: 5299, condition: 9, images: ['/uploads/laptop1.jpg', '/uploads/laptop2.jpg'],
    sellerId: 101, sellerNickname: '小明', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-20T10:30:00.000Z',
  },
  {
    id: 2, title: '高等数学（第七版）', description: '几乎全新，只有笔记，无缺页', category: '图书教材',
    price: 25, originalPrice: 46, condition: 9, images: ['/uploads/book1.jpg'],
    sellerId: 102, sellerNickname: '小红', sellerSchool: '南方科技大学', status: 'active',
    createdAt: '2026-06-21T08:00:00.000Z',
  },
  {
    id: 3, title: '宿舍用小冰箱', description: '50L，适合宿舍，9成新，包送货到楼下', category: '生活家电',
    price: 299, originalPrice: 699, condition: 8, images: ['/uploads/fridge1.jpg'],
    sellerId: 103, sellerNickname: '张三', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-18T14:20:00.000Z',
  },
  {
    id: 4, title: '机械键盘（青轴）', description: '达尔优EK815，用了两个月，灯效完好', category: '电子产品',
    price: 120, originalPrice: 259, condition: 8, images: ['/uploads/keyboard1.jpg'],
    sellerId: 101, sellerNickname: '小明', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-22T11:10:00.000Z',
  },
  {
    id: 5, title: '折叠书桌', description: '床上用折叠小桌子，八成新，可调节高度', category: '家居用品',
    price: 45, originalPrice: 99, condition: 7, images: ['/uploads/desk1.jpg'],
    sellerId: 104, sellerNickname: '李四', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-19T16:45:00.000Z',
  },
  {
    id: 6, title: '英语四级真题集', description: '2025年新版，只做了一套题', category: '图书教材',
    price: 15, originalPrice: 39, condition: 9, images: ['/uploads/cet4.jpg'],
    sellerId: 102, sellerNickname: '小红', sellerSchool: '南方科技大学', status: 'active',
    createdAt: '2026-06-23T09:30:00.000Z',
  },
  {
    id: 7, title: '吉他（民谣）', description: '卡马D1C，九成新，带包和调音器', category: '文体乐器',
    price: 350, originalPrice: 599, condition: 9, images: ['/uploads/guitar1.jpg'],
    sellerId: 103, sellerNickname: '张三', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-20T13:00:00.000Z',
  },
  {
    id: 8, title: '宿舍吊椅', description: '彩色布吊椅，承重200斤，有轻微褪色', category: '家居用品',
    price: 50, originalPrice: 128, condition: 6, images: ['/uploads/chair1.jpg'],
    sellerId: 105, sellerNickname: '王五', sellerSchool: '深圳大学', status: 'active',
    createdAt: '2026-06-22T17:20:00.000Z',
  },
  {
    id: 9, title: '已下架测试商品', description: '该商品已被卖家下架', category: '其他',
    price: 1, originalPrice: 10, condition: 5, images: [],
    sellerId: 101, sellerNickname: '小明', sellerSchool: '深圳大学', status: 'removed',
    createdAt: '2026-06-20T10:00:00.000Z',
  },
  // 成员A的数据示例（已合并上面，这里可留空，若需更多可补充）
];

// 评论数据（成员C提供）
const comments = [
  {
    id: 1, productId: 1, userId: 2, userNickname: '李四',
    content: '还在吗？', createdAt: '2026-06-21T10:30:00.000Z',
  },
  {
    id: 2, productId: 1, userId: 3, userNickname: '王五',
    content: '我想要，最低多少钱？', createdAt: '2026-06-21T11:00:00.000Z',
  },
];

// ---------- 引入认证中间件（从成员A的 auth.js 导入） ----------
// 注意：如果 server/routes/auth.js 未导出 authMiddleware，请自行调整导入方式
let authMiddleware;
try {
  const auth = require('./auth');
  authMiddleware = auth.authMiddleware || auth; // 兼容两种导出方式
} catch {
  // 若 auth.js 不存在，提供一个临时兼容中间件
  authMiddleware = (req, res, next) => next();
}

// ======================== 商品列表 ========================
// GET /api/products
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search, category, priceOrder, status, mine } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filtered = [...products];

  // 我的发布筛选（需登录）
  if (mine && req.headers.authorization) {
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, 'campus-trade-secret-key-2026');
      filtered = filtered.filter((p) => p.sellerId === decoded.id);
    } catch { /* 忽略认证错误 */ }
  }

  // 状态筛选
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  } else if (!mine) {
    filtered = filtered.filter((p) => p.status === 'active'); // 默认只展示在售
  }

  // 关键词搜索
  if (search) {
    const kw = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    );
  }

  // 分类筛选（支持逗号分隔多选）
  if (category) {
    const cats = category.split(',');
    filtered = filtered.filter((p) => cats.includes(p.category));
  }

  // 价格排序
  if (priceOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const pagedProducts = filtered.slice(start, start + limitNum);

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
  // 附带评论（成员C的增强功能）
  const productComments = comments.filter((c) => c.productId === id);
  res.json({ product, comments: productComments });
});

// ======================== 发布商品 ========================
// POST /api/products
router.post('/', authMiddleware, (req, res) => {
  const { title, description, category, price, originalPrice, condition, images } = req.body;
  if (!title || !description || !category || price == null) {
    return res.status(400).json({ message: '标题、描述、分类、价格为必填项' });
  }

  // 从 JWT 解析的 user 对象中获取卖家信息
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

// ======================== 编辑/下架商品 ========================
// PUT /api/products/:id
router.put('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);
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

// ======================== 删除商品（软删除） ========================
// DELETE /api/products/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: '商品不存在' });
  if (products[idx].sellerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: '无权操作该商品' });
  }
  products[idx].status = 'deleted';
  res.json({ message: '商品已删除' });
});

module.exports = router;
