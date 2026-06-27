const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 注意：需要引入路由文件，路径自行调整
const commentsRouter = require('./routes/comments');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');

// 挂载
app.use('/api', commentsRouter);
app.use('/api', ordersRouter);
app.use('/api', reviewsRouter);

// 挂载路由（各模块开发时逐渐取消注释）
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
