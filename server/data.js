const { db, genId } = require('./db');

module.exports = {
  users: db.users,
  products: db.products,
  orders: db.orders,
  comments: db.comments,
  reviews: db.reviews,
  genId,
};
