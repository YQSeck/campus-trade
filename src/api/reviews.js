// 【模块四：评价与信誉体系】评价 API
// AI 生成：手动调整前请勿修改
import request from "@/utils/request";

// 【模块四】提交订单评价 POST /api/orders/:id/review
export function createReview(orderId, data) {
  return request.post(`/orders/${orderId}/review`, data);
}

// 【模块四】获取用户信誉 GET /api/users/:id/reputation
export function getUserReputation(userId) {
  return request.get(`/users/${userId}/reputation`);
}
