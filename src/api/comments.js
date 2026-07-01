import request from '@/utils/request';

export function getComments(productId, params) {
  return request.get(`/products/${productId}/comments`, { params });
}

export function addComment(productId, content, parentId = null) {
  return request.post(`/products/${productId}/comments`, { content, parentId });
}
