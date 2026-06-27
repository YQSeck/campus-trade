// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
import { defineStore } from 'pinia';
import { getProfile } from '@/api/auth';

// 鐢ㄦ埛鐘舵€佺鐞嗭細token 鎸佷箙鍖栧埌 localStorage锛寀serInfo 浠呭湪鍐呭瓨涓?export const useUserStore = defineStore('user', {
  state: () => ({
    // 鍒濆鍖栨椂浠?localStorage 鎭㈠ token锛屾敮鎸侀〉闈㈠埛鏂板悗淇濇寔鐧诲綍
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    // 瑙掕壊鍒ゆ柇锛?user' | 'admin'
    isAdmin: (state) => state.userInfo?.role === 'admin'
  },
  actions: {
    // 鐧诲綍鎴愬姛鍚庤皟鐢紝鍚屾 token 鍒?state 鍜?localStorage
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    // 浠呭湪閫€鍑虹櫥褰曟椂璋冪敤锛屾竻闄?token
    removeToken() {
      this.token = '';
      localStorage.removeItem('token');
    },
    // 鑾峰彇鐢ㄦ埛淇℃伅锛堥渶鍦ㄧ櫥褰曞悗璋冪敤锛?    async fetchUserInfo() {
      const res = await getProfile();
      this.userInfo = res.data;
    },
    // 閫€鍑虹櫥褰曪細娓呴櫎 token銆侀噸缃敤鎴蜂俊鎭?    logout() {
      this.removeToken();
      this.userInfo = null;
    }
  }
});
