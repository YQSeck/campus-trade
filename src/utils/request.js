// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import axios from 'axios';

// 缁熶竴 Axios 瀹炰緥锛氭墍鏈?API 璇锋眰蹇呴』閫氳繃姝ゅ疄渚嬪彂鍑?const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// JWT 璇锋眰鎷︽埅鍣細鑷姩浠?localStorage 璇诲彇 token 骞堕檮鍔犲埌璇锋眰澶?request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default request;
