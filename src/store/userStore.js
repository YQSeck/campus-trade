import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProfile } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loginDialogVisible = ref(false);
  const registerDialogVisible = ref(false);
  const forgotDialogVisible = ref(false);

  const tokenRef = ref(sessionStorage.getItem('token'));

  const isLoggedIn = computed(() => !!tokenRef.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function init() {
    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (token && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        tokenRef.value = token;
      } catch {
        sessionStorage.removeItem('user');
        user.value = null;
      }
    }
  }

  function setLogin(token, userData) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    tokenRef.value = token;
    user.value = userData;
    loginDialogVisible.value = false;
  }

  async function fetchUserInfo() {
    try {
      const res = await getProfile();
      user.value = res.data.user;
      sessionStorage.setItem('user', JSON.stringify(user.value));
    } catch {
      void 0;
    }
  }

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    tokenRef.value = null;
    user.value = null;
  }

  function updateProfile(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
      sessionStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  function openLogin() {
    loginDialogVisible.value = true;
  }
  function openRegister() {
    registerDialogVisible.value = true;
  }
  function openForgot() {
    forgotDialogVisible.value = true;
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
    fetchUserInfo,
    logout,
    updateProfile,
    openLogin,
    openRegister,
    openForgot,
  };
});
