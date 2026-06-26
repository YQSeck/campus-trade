const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 挂载路由（各模块开发时逐渐取消注释）
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
