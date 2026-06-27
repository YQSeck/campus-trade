// AI 合并版本：采用自动导入路由模块，各模块只需在 modules/ 下添加文件即可注册
import { createRouter, createWebHistory } from 'vue-router';

// 使用 Vite 的 import.meta.glob 自动加载 modules 目录下所有 .js 文件
const moduleFiles = import.meta.glob('./modules/*.js', { eager: true });
const routes = [];

Object.values(moduleFiles).forEach((module) => {
  if (module.default) {
    routes.push(...module.default);
  }
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
