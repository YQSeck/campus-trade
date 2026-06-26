// AI 生成，手动调整：按模块拆分路由，字段对齐项目规范
// 成员 A：用户系统 + 商品管理路由

const productRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/products/ProductList.vue'),
  },
  {
    path: '/product/:id',
    name: 'productDetail',
    component: () => import('@/views/products/ProductDetail.vue'),
  },
  {
    path: '/publish',
    name: 'publish',
    component: () => import('@/views/products/PublishProduct.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-products',
    name: 'myProducts',
    component: () => import('@/views/user/MyProducts.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { requiresAuth: true },
  },
];

export default productRoutes;
