// AI 生成：订单路由
export default [
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('@/views/orders/OrderList.vue'),
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/orders/OrderDetail.vue'),
  }
];
