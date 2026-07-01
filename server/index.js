// AI 生成，手动调整：添加 CORS 白名单配置、API Key 中间件、模块注释
const express = require('express');
const cors = require('cors');
const { authRouter, userRouter, uploadRouter } = require('./routes/auth');
const { apiKeyMiddleware } = require('./middleware');
const pricingRoutes = require('../src/skills/pricingRoutes');

const app = express();
app.use(
  cors({
    origin: ['https://campustrade.example.com', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 模块一：用户系统
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);

// 模块二 + 模块六：商品（API Key 中间件对第三方 GET 请求生效）
app.use('/api/products', apiKeyMiddleware);
app.use('/api/products', require('./routes/comments'));
app.use('/api/products', require('./routes/products'));

// 模块三：订单
app.use('/api/orders', require('./routes/orders'));

// 模块四：评价
app.use('/api/reviews', require('./routes/reviews'));

// 模块一/四/五/七：用户扩展
app.use('/api/users', require('./routes/users'));

// 模块五：举报接收
app.use('/api/reports', require('./routes/reports'));

// 模块五：后台管理
app.use('/api/admin', require('./routes/admin'));

// 模块八：开放 Skill
app.use('/api/skills', pricingRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CampusTrade 后端已启动: http://localhost:${PORT}`);
    console.log('管理员账号: admin@campus.edu / admin123');
    console.log('普通用户:   user@campus.edu  / user123');
  });
}

module.exports = app;
