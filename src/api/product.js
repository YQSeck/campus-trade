// 【模块二 & 模块六】商品 API（合并自成员A与成员C）
// AI 生成：手动调整前请勿修改
import request from "@/utils/request";

// 【模块六】获取商品列表 GET /api/products（分页、搜索、筛选、排序）
export function getProducts(params = {}) {
  return request.get("/products", { params });
}

// 【模块六】获取商品详情 GET /api/products/:id
export function getProductDetail(id) {
  return request.get(`/products/${id}`);
}

// 【模块二】发布商品 POST /api/products
export function createProduct(data) {
  return request.post("/products", data);
}

// 【模块二】更新商品 PUT /api/products/:id（编辑或下架/上架）
export function updateProduct(id, data) {
  return request.put(`/products/${id}`, data);
}

// 【模块二】删除商品 DELETE /api/products/:id（软删除）
export function deleteProduct(id) {
  return request.delete(`/products/${id}`);
}
