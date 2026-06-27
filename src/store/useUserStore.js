// AI 生成，手动调整：新增tokenRef响应式桥接修复localStorage非响应式导致的UI不更新
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loginDialogVisible = ref(false);
  const registerDialogVisible = ref(false);
  const forgotDialogVisible = ref(false);

  // 响应式 token 桥接：localStorage 不是响应式的，需要 ref 中转
  const tokenRef = ref(localStorage.getItem('token'));
  let _loginCallback = null;

  // isLoggedIn 依赖响应式的 tokenRef，token 变化时自动重算
  const isLoggedIn = computed(() => !!tokenRef.value);

  const isAdmin = computed(() => user.value?.role === 'admin');

  function init() {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        tokenRef.value = token;
      } catch {
        localStorage.removeItem('user');
        user.value = null;
      }
    }
  }

  function setLogin(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    tokenRef.value = token;
    user.value = userData;
    loginDialogVisible.value = false;
    _loginCallback = null;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    tokenRef.value = null;
    user.value = null;
    _loginCallback = null;
  }

  function updateProfile(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  function openLogin(callback = null) {
    loginDialogVisible.value = true;
    if (callback) _loginCallback = callback;
  }

  function getLoginCallback() {
    const cb = _loginCallback;
    _loginCallback = null;
    return cb;
  }

  init();

  return {
    user,
    loginDialogVisible,
    registerDialogVisible,
    forgotDialogVisible,
    isLoggedIn,
    isAdmin,
    setLogin,
    logout,
    updateProfile,
    openLogin,
    getLoginCallback,
  };
});
