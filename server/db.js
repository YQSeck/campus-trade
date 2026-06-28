// 【公共基础】统一内存数据库，供各模块共享
// AI 生成：手动调整前请勿修改
const { hashPassword } = require('./middleware');

const db = {
  // 模块一：用户系统
  users: [
    {
      id: 1,
      email: 'admin@campus.edu',
      phone: '13800000001',
      password: hashPassword('admin123'),
      nickname: '管理员',
      school: 'XX大学',
      avatarUrl: '',
      contact: '',
      contactVisible: true,
      role: 'admin',
      reputationScore: 100,
      banned: false,
      lockedUntil: null,
      loginAttempts: 0,
      createdAt: '2026-06-20T10:30:00.000Z',
    },
    {
      id: 2,
      email: 'user@campus.edu',
      phone: '13800000002',
      password: hashPassword('user123'),
      nickname: '张三',
      school: 'XX大学',
      avatarUrl: '',
      contact: 'wx: zhangsan',
      contactVisible: true,
      role: 'user',
      reputationScore: 90,
      banned: false,
      lockedUntil: null,
      loginAttempts: 0,
      createdAt: '2026-06-20T10:30:00.000Z',
    },
    {
      id: 3,
      email: 'lisi@campus.edu',
      phone: '13800000003',
      password: hashPassword('user123'),
      nickname: '李四',
      school: 'XX大学',
      avatarUrl: '',
      contact: '',
      contactVisible: false,
      role: 'user',
      reputationScore: 80,
      banned: false,
      lockedUntil: null,
      loginAttempts: 0,
      createdAt: '2026-06-21T10:30:00.000Z',
    },
  ],
  // 模块二：商品发布与管理
  products: [
    {
      id: 1,
      title: '高等数学教材第七版',
      description: '只用了一学期，几乎全新，笔记很少',
      category: '书籍',
      price: 25,
      originalPrice: 49,
      condition: 9,
      images: [],
      sellerId: 2,
      sellerNickname: '张三',
      sellerSchool: 'XX大学',
      status: 'active',
      createdAt: '2026-06-22T10:30:00.000Z',
    },
    {
      id: 2,
      title: 'iPad Air 4 64G',
      description: '使用一年，无划痕，配件齐全',
      category: '电子产品',
      price: 2000,
      originalPrice: 4399,
      condition: 8,
      images: [],
      sellerId: 2,
      sellerNickname: '张三',
      sellerSchool: 'XX大学',
      status: 'active',
      createdAt: '2026-06-23T14:30:00.000Z',
    },
    {
      id: 3,
      title: 'LED 台灯',
      description: '三档调光，宿舍必备',
      category: '生活用品',
      price: 15,
      originalPrice: 39,
      condition: 7,
      images: [],
      sellerId: 3,
      sellerNickname: '李四',
      sellerSchool: 'XX大学',
      status: 'active',
      createdAt: '2026-06-24T09:00:00.000Z',
    },
    {
      id: 4,
      title: 'Python编程从入门到实践',
      description: '经典入门书籍，轻微笔记',
      category: '书籍',
      price: 30,
      originalPrice: 89,
      condition: 8,
      images: [],
      sellerId: 3,
      sellerNickname: '李四',
      sellerSchool: 'XX大学',
      status: 'active',
      createdAt: '2026-06-25T11:00:00.000Z',
    },
    {
      id: 5,
      title: '机械键盘 Keychron K2',
      description: '青轴，用了半年，声音清脆',
      category: '电子产品',
      price: 150,
      originalPrice: 350,
      condition: 8,
      images: [],
      sellerId: 2,
      sellerNickname: '张三',
      sellerSchool: 'XX大学',
      status: 'active',
      createdAt: '2026-06-25T16:00:00.000Z',
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
      sellerId: 2,
      sellerNickname: '张三',
      sellerSchool: 'XX大学',
      status: 'removed',
      createdAt: '2026-06-20T10:00:00.000Z',
    },
  ],
  // 模块三：交易与订单
  orders: [
    {
      id: 1,
      buyerId: 3,
      sellerId: 2,
      productId: 1,
      productTitle: '高等数学教材第七版',
      price: 25,
      status: 'received',
      createdAt: '2026-06-26T08:00:00.000Z',
    },
    {
      id: 2,
      buyerId: 1,
      sellerId: 2,
      productId: 5,
      productTitle: '机械键盘 Keychron K2',
      price: 150,
      status: 'shipped',
      createdAt: '2026-06-25T15:00:00.000Z',
    },
    {
      id: 3,
      buyerId: 2,
      sellerId: 3,
      productId: 3,
      productTitle: 'LED 台灯',
      price: 15,
      status: 'received',
      createdAt: '2026-06-24T12:00:00.000Z',
    },
    {
      id: 4,
      buyerId: 3,
      sellerId: 2,
      productId: 2,
      productTitle: 'iPad Air 4 64G',
      price: 2000,
      status: 'cancelled',
      createdAt: '2026-06-23T10:00:00.000Z',
    },
  ],
  // 模块三：交易与订单（商品留言）
  comments: [
    {
      id: 1,
      productId: 1,
      userId: 3,
      userNickname: '李四',
      content: '还在吗？',
      parentId: null,
      createdAt: '2026-06-21T10:30:00.000Z',
    },
    {
      id: 2,
      productId: 1,
      userId: 2,
      userNickname: '张三',
      content: '在的，可以面交',
      parentId: 1,
      createdAt: '2026-06-21T11:00:00.000Z',
    },
  ],
  // 模块四：评价与信誉体系
  reviews: [],
  // 模块五：后台管理（举报）
  reports: [
    {
      id: 1,
      targetType: 'product',
      targetId: 1,
      reason: '疑似假货',
      reporterId: 3,
      status: 'pending',
      createdAt: '2026-06-24T09:00:00.000Z',
    },
  ],
  nextId: {
    user: 10,
    product: 20,
    order: 10,
    comment: 10,
    review: 10,
    report: 10,
  },
};

function genId(type) {
  return db.nextId[type]++;
}

function findUser(id) {
  return db.users.find((u) => u.id === id);
}

function enrichOrder(order) {
  const product = db.products.find((p) => p.id === order.productId);
  const buyer = findUser(order.buyerId);
  const seller = findUser(order.sellerId);
  const status = order.status === 'received' ? 'completed' : order.status;
  return {
    id: order.id,
    productId: order.productId,
    productTitle: order.productTitle || (product ? product.title : '未知商品'),
    productCategory: product ? product.category : '未知',
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    buyerName: buyer ? buyer.nickname : '未知',
    sellerName: seller ? seller.nickname : '未知',
    status,
    price: order.price,
    createdAt: order.createdAt,
  };
}

module.exports = { db, genId, findUser, enrichOrder };
