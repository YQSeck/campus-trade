// AI 生成，手动调整：管理员 API 封装
import request from '@/utils/request';

export const getAdminStats = () => request.get('/admin/stats');

export const getAdminProducts = (page = 1) => request.get('/admin/products', { params: { page } });

export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) => request.delete(`/admin/products/${id}`);

export const getAdminUsers = (page = 1) => request.get('/admin/users', { params: { page } });

export const banUserApi = (id) => request.put(`/admin/users/${id}`, { action: 'ban' });

export const unbanUserApi = (id) => request.put(`/admin/users/${id}`, { action: 'unban' });

export const resetPasswordApi = (id) => request.put(`/admin/users/${id}`, { action: 'reset_password' });

export const getReports = (page = 1) => request.get('/admin/reports', { params: { page } });

export const resolveReportApi = (id) => request.put(`/admin/reports/${id}`, { status: 'resolved' });

export const dismissReportApi = (id) => request.put(`/admin/reports/${id}`, { status: 'dismissed' });
