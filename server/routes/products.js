// AI 生成，手动调整：完善商品开放API，增加搜索、分类筛选、价格排序，详情附带评论
const express = require('express');
const router = express.Router();

// ---------- Mock 数据（内存数组） ----------
const products = [
  {
    id: 1,
    title: '二手笔记本',
    description: '联想小新Pro14，九成新，使用一年，无维修',
    category: '电子产品',
    price: 2800,
    originalPrice: 5299,
    condition: 9,
    images: ['/uploads/laptop1.jpg', '/uploads/laptop2.jpg'],
    sellerId: 101,
    sellerNickname: '小明',
    status: 'active',
    createdAt: '2026-06-20T10:30:00.000Z',
  },
  {
    id: 2,
    title: '高等数学（第七版）',
    description: '几乎全新，只有笔记，无缺页',
    category: '图书教材',
    price: 25,
    originalPrice: 46,
    condition: 9,
    images: ['/uploads/book1.jpg'],
    sellerId: 102,
    sellerNickname: '小红',
    status: 'active',
    createdAt: '2026-06-21T08:00:00.000Z',
  },
  {
    id: 3,
    title: '宿舍用小冰箱',
    description: '50L，适合宿舍，9成新，包送货到楼下',
    category: '生活家电',
    price: 299,
    originalPrice: 699,
    condition: 8,
    images: ['/uploads/fridge1.jpg'],
    sellerId: 103,
    sellerNickname: '张三',
    status: 'active',
    createdAt: '2026-06-18T14:20:00.000Z',
  },
  {
    id: 4,
    title: '机械键盘（青轴）',
    description: '达尔优EK815，用了两个月，灯效完好',
    category: '电子产品',
    price: 120,
    originalPrice: 259,
    condition: 8,
    images: ['/uploads/keyboard1.jpg'],
    sellerId: 101,
    sellerNickname: '小明',
    status: 'active',
    createdAt: '2026-06-22T11:10:00.000Z',
  },
  {
    id: 5,
    title: '折叠书桌',
    description: '床上用折叠小桌子，八成新，可调节高度',
    category: '家居用品',
    price: 45,
    originalPrice: 99,
    condition: 7,
    images: ['/uploads/desk1.jpg'],
    sellerId: 104,
    sellerNickname: '李四',
    status: 'active',
    createdAt: '2026-06-19T16:45:00.000Z',
  },
  {
    id: 6,
    title: '英语四级真题集',
    description: '2025年新版，只做了一套题',
    category: '图书教材',
    price: 15,
    originalPrice: 39,
    condition: 9,
    images: ['/uploads/cet4.jpg'],
    sellerId: 102,
    sellerNickname: '小红',
    status: 'active',
    createdAt: '2026-06-23T09:30:00.000Z',
  },
  {
    id: 7,
    title: '吉他（民谣）',
    description: '卡马D1C，九成新，带包和调音器',
    category: '文体乐器',
    price: 350,
    originalPrice: 599,
    condition: 9,
    images: ['/uploads/guitar1.jpg'],
    sellerId: 103,
    sellerNickname: '张三',
    status: 'active',
    createdAt: '2026-06-20T13:00:00.000Z',
  },
  {
    id: 8,
    title: '宿舍吊椅',
    description: '彩色布吊椅，承重200斤，有轻微褪色',
    category: '家居用品',
    price: 50,
    originalPrice: 128,
    condition: 6,
    images: ['/uploads/chair1.jpg'],
    sellerId: 105,
    sellerNickname: '王五',
    status: 'active',
    createdAt: '2026-06-22T17:20:00.000Z',
  },
  {
    id: 9,
    title: '已下架测试商品',
    description: '该商品已被卖家下架',
    category: '其他',
    price: 1,
    originalPrice: 10,
    condition: 5,
    images: [],
    sellerId: 101,
    sellerNickname: '小明',
    status: 'removed',
    createdAt: '2026-06-20T10:00:00.000Z',
  },
];

const comments = [
  {
    id: 1,
    productId: 1,
    userId: 2,
    userNickname: '李四',
    content: '还在吗？',
    createdAt: '2026-06-21T10:30:00.000Z',
  },
  {
    id: 2,
    productId: 1,
    userId: 3,
    userNickname: '王五',
    content: '我想要，最低多少钱？',
    createdAt: '2026-06-21T11:00:00.000Z',
  },
];

// ---------- 开放API ----------
// GET /api/products —— 分页列表，支持搜索、分类筛选、价格排序
router.get('/', (req, res) => {
  let { page = 1, limit = 10, search, category, priceOrder } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let filtered = products.filter((p) => p.status === 'active'); // 只展示在售商品

  // 搜索：匹配标题或描述
  if (search) {
    const keyword = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)
    );
  }

  // 分类筛选
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  // 价格排序
  if (priceOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({
    products: items,
    total,
    page,
    limit,
  });
});

// GET /api/products/:id —— 商品详情（附带评论）
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: '商品不存在' });
  }
  const productComments = comments.filter((c) => c.productId === productId);
  res.json({ product, comments: productComments });
});

module.exports = router;
