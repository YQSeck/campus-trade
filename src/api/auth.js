// AI 生成，手动调整：字段名严格对齐 API.md 中的 camelCase 规范

import request from '@/utils/request';

// 注册
// POST /api/auth/register  body: { email, password, nickname, school }
// 响应: { message, userId }
export function register(data) {
  return request.post('/auth/register', data);
}

// 登录
// POST /api/auth/login  body: { email, password }
// 响应: { token, user: { id, email, nickname, ... } }
export function login(data) {
  return request.post('/auth/login', data);
}

// 忘记密码
// POST /api/auth/forgot-password  body: { email }
// 响应: { message: "新密码已发送至邮箱" }
export function forgotPassword(data) {
  return request.post('/auth/forgot-password', data);
}

// 获取个人信息
// GET /api/user/profile  需要 Authorization 头（由 request 拦截器自动携带）
export function getProfile() {
  return request.get('/user/profile');
}

// 更新个人信息
// PUT /api/user/profile  body: { nickname?, school?, avatarUrl?, contact? }
export function updateProfile(data) {
  return request.put('/user/profile', data);
}

// 修改密码
// PUT /api/user/password  body: { oldPassword, newPassword }
export function changePassword(data) {
  return request.put('/user/password', data);
}
