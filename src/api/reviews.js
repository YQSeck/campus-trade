// AI 生成，手动调整：createReview 使用 POST /api/reviews 端点
import request from '@/utils/request';

export function createReview(orderId, data) {
  return request.post('/reviews', { orderId, ...data });
}

export function getUserReputation(userId) {
  return request.get(`/users/${userId}/reputation`);
}
