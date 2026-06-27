//商品留言 API
import request from '@/utils/request';

export function getComments(productId, params) {
  return request.get(`/products/${productId}/comments`, { params });
}

export function addComment(productId, content) {
  return request.post(`/products/${productId}/comments`, { content });
}
