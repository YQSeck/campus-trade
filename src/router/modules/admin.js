// 【模块五：后台管理】管理员面板路由
// AI 生成：手动调整前请勿修改
const adminRoutes = [
  {
    path: "/admin",
    name: "AdminPanel",
    component: () => import("@/views/admin/AdminPanel.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
];

export default adminRoutes;
