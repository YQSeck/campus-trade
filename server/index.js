// 【模块六：开放 API】Express 服务入口，CORS 与路由挂载
// AI 生成：手动调整前请勿修改
const express = require('express');
const cors = require('cors');
const { authRouter, userRouter, uploadRouter } = require('./routes/auth');
const pricingRoutes = require('../src/skills/pricingRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ---------- 模块一：用户系统 ----------
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);

// ---------- 模块二：商品发布与管理 + 模块三：商品留言 ----------
// 评论路由需在商品 /:id 之前挂载
app.use('/api/products', require('./routes/comments'));
app.use('/api/products', require('./routes/products'));

// ---------- 模块三：交易与订单 + 模块四：订单评价 ----------
app.use('/api/orders', require('./routes/orders'));
app.use('/api/orders', require('./routes/reviews'));

// ---------- 模块一/四/五/七：用户扩展接口 ----------
app.use('/api/users', require('./routes/users'));

// ---------- 模块五：后台管理（举报） ----------
app.use('/api/reports', require('./routes/reports'));

// ---------- 模块五：后台管理 ----------
app.use('/api/admin', require('./routes/admin'));

// ---------- 模块八：开放 Skill ----------
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
