import { createRouter, createWebHistory } from 'vue-router';

// 汇总各模块路由（后续导入）
const routes = [
  // ... 各模块路由将在整合时添加
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
