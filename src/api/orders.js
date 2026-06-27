//订单相关 API
import request from '@/utils/request';

// 创建订单
export function createOrder(productId) {
  return request.post('/orders', { productId });
}

// 获取订单列表
export function getOrderList(params) {
  return request.get('/orders', { params });
}

// 获取订单详情
export function getOrderDetail(id) {
  return request.get(`/orders/${id}`);
}

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status });
}

// 模拟支付
export function payOrder(id) {
  return request.post(`/orders/${id}/pay`);
}
