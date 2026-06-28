// 【模块三：交易与订单】商品留言 API
// AI 生成：手动调整前请勿修改
import request from "@/utils/request";

// 【模块三】获取商品留言 GET /api/products/:id/comments
export function getComments(productId, params) {
  return request.get(`/products/${productId}/comments`, { params });
}

// 【模块三】发布留言 POST /api/products/:id/comments
export function addComment(productId, content, parentId = null) {
  return request.post(`/products/${productId}/comments`, { content, parentId });
}
