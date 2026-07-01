// AI 生成，手动调整：匹配分离的 ban/unban 端点、添加 review hide
import request from '@/utils/request';

export const getAdminStats = () => request.get('/admin/stats');

export const getAdminProducts = (page = 1) => request.get('/admin/products', { params: { page } });

export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) => request.delete(`/admin/products/${id}`);

export const getAdminUsers = (page = 1) => request.get('/admin/users', { params: { page } });

export const banUserApi = (id) => request.put(`/admin/users/${id}/ban`);

export const unbanUserApi = (id) => request.put(`/admin/users/${id}/unban`);

export const resetPasswordApi = (id) => request.put(`/admin/users/${id}/reset-password`);

export const getReports = (page = 1) => request.get('/admin/reports', { params: { page } });

export const resolveReportApi = (id) => request.put(`/admin/reports/${id}`, { status: 'resolved' });

export const dismissReportApi = (id) =>
  request.put(`/admin/reports/${id}`, { status: 'dismissed' });

export const getAdminReviews = () => request.get('/admin/reviews');

export const hideReviewApi = (id) => request.put(`/admin/reviews/${id}/hide`);

export const deleteReviewApi = (id) => request.delete(`/admin/reviews/${id}`);

export const deleteCommentApi = (id) => request.delete(`/admin/comments/${id}`);
