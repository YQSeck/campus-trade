const express = require('express');
const cors = require('cors');
const { authRouter, userRouter, uploadRouter } = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 挂载认证、用户、上传路由
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);

// 挂载商品路由
app.use('/api/products', require('./routes/products'));

// 挂载商品评论路由（内部路径应为 /:id/comments）
app.use('/api/products', require('./routes/comments'));

// 挂载订单路由
app.use('/api/orders', require('./routes/orders'));

// 挂载评价路由（内部路径应为 /:id/review）
app.use('/api/orders', require('./routes/reviews'));

// 挂载管理后台路由（成员C模块）
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
