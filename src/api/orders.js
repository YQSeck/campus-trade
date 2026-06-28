// 【模块三：交易与订单】订单 API
// AI 生成：手动调整前请勿修改
//订单相关 API
import request from "@/utils/request";

// 【模块三】创建订单 POST /api/orders
export function createOrder(productId) {
  return request.post("/orders", { productId });
}

// 【模块三】获取订单列表 GET /api/orders
export function getOrderList(params) {
  return request.get("/orders", { params });
}

// 【模块三】获取订单详情 GET /api/orders/:id
export function getOrderDetail(id) {
  return request.get(`/orders/${id}`);
}

// 【模块三】更新订单状态 PUT /api/orders/:id/status
export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status });
}

// 【模块三】模拟支付 POST /api/orders/:id/pay
export function payOrder(id) {
  return request.post(`/orders/${id}/pay`);
}
