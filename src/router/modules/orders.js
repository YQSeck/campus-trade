export default [
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('@/views/orders/OrderList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/orders/OrderDetail.vue'),
    meta: { requiresAuth: true },
  },
];
