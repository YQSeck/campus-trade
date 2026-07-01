const adminRoutes = [
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/views/admin/AdminPanel.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
];

export default adminRoutes;
