// 【公共基础】路由注册与登录守卫
// AI 生成：手动调整前请勿修改
import { createRouter, createWebHistory } from "vue-router";

// 使用 Vite 的 import.meta.glob 自动加载 modules 目录下所有 .js 文件
const moduleFiles = import.meta.glob("./modules/*.js", { eager: true });
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  let user = null;
  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch {
      user = null;
    }
  }

  if (to.meta.requiresAuth && !token) {
    next("/");
    return;
  }

  if (to.meta.role === "admin" && user?.role !== "admin") {
    next("/");
    return;
  }

  next();
});

export default router;
