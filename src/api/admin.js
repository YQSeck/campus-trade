// 【模块五：后台管理】管理员 API
// AI 生成：手动调整前请勿修改
import request from "@/utils/request";

// 【模块五】数据统计
export const getAdminStats = () => request.get("/admin/stats");

// 【模块五】商品审核
export const getAdminProducts = (page = 1) =>
  request.get("/admin/products", { params: { page } });

export const updateProduct = (id, data) =>
  request.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) => request.delete(`/admin/products/${id}`);

// 【模块五】用户管理
export const getAdminUsers = (page = 1) =>
  request.get("/admin/users", { params: { page } });

export const banUserApi = (id) =>
  request.put(`/admin/users/${id}`, { action: "ban" });

export const unbanUserApi = (id) =>
  request.put(`/admin/users/${id}`, { action: "unban" });

export const resetPasswordApi = (id) =>
  request.put(`/admin/users/${id}`, { action: "reset_password" });

// 【模块五】举报处理
export const getReports = (page = 1) =>
  request.get("/admin/reports", { params: { page } });

export const resolveReportApi = (id) =>
  request.put(`/admin/reports/${id}`, { status: "resolved" });

export const dismissReportApi = (id) =>
  request.put(`/admin/reports/${id}`, { status: "dismissed" });
