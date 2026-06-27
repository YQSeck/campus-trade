import { createRouter, createWebHistory } from 'vue-router';

// 导入各模块路由
import productRoutes from './modules/product';

const routes = [
  ...productRoutes,
  // ... 其他模块路由由成员C整合时添加
];

import orderRoutes from './modules/orders';
// ...
const routes = [
  // ...
  ...orderRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
