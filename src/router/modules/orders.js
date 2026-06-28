// 【模块三：交易与订单】订单页面路由
// AI 生成：手动调整前请勿修改
export default [
  {
    path: "/orders",
    name: "OrderList",
    component: () => import("@/views/orders/OrderList.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    name: "OrderDetail",
    component: () => import("@/views/orders/OrderDetail.vue"),
    meta: { requiresAuth: true },
  },
];
