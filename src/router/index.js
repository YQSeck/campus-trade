import { createRouter, createWebHistory } from 'vue-router';

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

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const savedUser = sessionStorage.getItem('user');
  let user = null;
  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch {
      user = null;
    }
  }

  if (to.meta.requiresAuth && !token) {
    next('/');
    return;
  }

  if (to.meta.role === 'admin' && user?.role !== 'admin') {
    next('/');
    return;
  }

  next();
});

export default router;
