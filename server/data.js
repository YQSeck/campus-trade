// 初始数据仅用于本地调试，最终需替换为数据库

const users = [
  {
    id: 1,
    email: 'admin@campus.com',
    password: 'admin123', // 实际需加密
    nickname: '管理员',
    school: 'XX大学',
    avatarUrl: '',
    contact: '',
    role: 'admin',
    reputationScore: 100,
    lockedUntil: null
  },
  {
    id: 2,
    email: 'seller@campus.com',
    password: '123456',
    nickname: '卖家张三',
    school: 'XX大学',
    avatarUrl: '',
    contact: '',
    role: 'user',
    reputationScore: 90,
    lockedUntil: null
  },
  {
    id: 3,
    email: 'buyer@campus.com',
    password: '123456',
    nickname: '买家李四',
    school: 'XX大学',
    avatarUrl: '',
    contact: '',
    role: 'user',
    reputationScore: 80,
    lockedUntil: null
  }
];

const products = [
  {
    id: 1,
    title: '二手笔记本',
    description: '九成新，考研结束出',
    category: '电子产品',
    price: 1500,
    originalPrice: 4500,
    condition: 9,
    images: ['/uploads/laptop.jpg'],
    sellerId: 2,
    sellerNickname: '卖家张三',
    sellerSchool: 'XX大学',
    status: 'active',
    createdAt: '2026-06-20T08:00:00.000Z'
  }
];

const orders = [];
const comments = []; 
const reviews = []; 

let nextId = {
  order: 1,
  comment: 1,
  review: 1
};

function genId(type) {
  return nextId[type]++;
}

module.exports = {
  users,
  products,
  orders,
  comments,
  reviews,
  genId
};
