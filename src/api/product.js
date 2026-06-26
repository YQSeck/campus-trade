// AI 生成，手动调整：字段名严格对齐 API.md，分页参数统一使用 page/limit
import request from '@/utils/request';

// 获取商品列表
// GET /api/products ?page, limit, search, category, priceOrder, mine
export function getProducts(params = {}) {
  return request.get('/products', { params });
}

// 获取商品详情
// GET /api/products/:id
export function getProductDetail(id) {
  return request.get(`/products/${id}`);
}

// 发布商品
// POST /api/products  body: { title, description, category, price, originalPrice, condition, images }
export function createProduct(data) {
  return request.post('/products', data);
}

// 更新商品（编辑或上下架）
// PUT /api/products/:id  body: 编辑时传商品字段, 下架时传 { status: 'removed' }
export function updateProduct(id, data) {
  return request.put(`/products/${id}`, data);
}

// 删除商品
// DELETE /api/products/:id
export function deleteProduct(id) {
  return request.delete(`/products/${id}`);
}
