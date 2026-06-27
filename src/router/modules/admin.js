// AI 生成，手动调整：管理员路由模块
const adminRoutes = [
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/views/admin/AdminPanel.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
];

export default adminRoutes;
