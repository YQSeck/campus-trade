//评价 API
import request from '@/utils/request';

export function createReview(orderId, data) {
  return request.post(`/orders/${orderId}/review`, data);
}

export function getUserReputation(userId) {
  return request.get(`/users/${userId}/reputation`);
}
