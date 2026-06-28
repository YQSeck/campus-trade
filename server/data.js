// 【公共基础】数据层兼容导出（指向 db.js）
// AI 生成：手动调整前请勿修改
// 兼容旧引用，实际数据来自 server/db.js
const { db, genId } = require('./db');

module.exports = {
  users: db.users,
  products: db.products,
  orders: db.orders,
  comments: db.comments,
  reviews: db.reviews,
  genId,
};
