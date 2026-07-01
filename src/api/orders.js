import request from '@/utils/request';

export function createOrder(productId) {
  return request.post('/orders', { productId });
}

export function getOrderList(params) {
  return request.get('/orders', { params });
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`);
}

export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status });
}

export function payOrder(id) {
  return request.post(`/orders/${id}/pay`);
}
