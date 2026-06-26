// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import request from '@/utils/request';

// 鐢ㄦ埛鐧诲綍锛氭垚鍔熷悗杩斿洖 JWT token锛岃皟鐢ㄦ柟闇€鑷瀛樺叆 localStorage 鍜?store
export function login(data) {
  return request.post('/auth/login', data);
}

// 鐢ㄦ埛娉ㄥ唽
export function register(data) {
  return request.post('/auth/register', data);
}

// 鑾峰彇褰撳墠鐧诲綍鐢ㄦ埛淇℃伅锛堥渶鎼哄甫 token锛?export function getProfile() {
  return request.get('/auth/profile');
}
