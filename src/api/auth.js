// 【模块一：用户系统】认证与个人资料 API
// AI 生成：手动调整前请勿修改

import request from "@/utils/request";

// 【模块一：用户系统】注册
// POST /api/auth/register
export function register(data) {
  return request.post("/auth/register", data);
}

// 【模块一：用户系统】登录
// POST /api/auth/login
export function login(data) {
  return request.post("/auth/login", data);
}

// 【模块一：用户系统】忘记密码
// POST /api/auth/forgot-password
export function forgotPassword(data) {
  return request.post("/auth/forgot-password", data);
}

// 【模块一：用户系统】获取个人信息
// GET /api/user/profile
export function getProfile() {
  return request.get("/user/profile");
}

// 【模块一：用户系统】更新个人信息
// PUT /api/user/profile
export function updateProfile(data) {
  return request.put("/user/profile", data);
}

// 【模块一：用户系统】修改密码
// PUT /api/user/password
export function changePassword(data) {
  return request.put("/user/password", data);
}
