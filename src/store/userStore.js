// 【模块一：用户系统】用户状态 Store（整合弹窗控制、个人信息获取）
// AI 生成：手动调整前请勿修改
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getProfile } from "@/api/auth";

export const useUserStore = defineStore("user", () => {
  // ---------- 状态 ----------
  const user = ref(null);
  const loginDialogVisible = ref(false);
  const registerDialogVisible = ref(false);
  const forgotDialogVisible = ref(false);

  // 响应式 token 桥接：localStorage 不是响应式的，需要 ref 中转
  const tokenRef = ref(localStorage.getItem("token"));

  // ---------- 计算属性 ----------
  const isLoggedIn = computed(() => !!tokenRef.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  // ---------- 初始化（恢复登录态） ----------
  function init() {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (token && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        tokenRef.value = token;
      } catch {
        localStorage.removeItem("user");
        user.value = null;
      }
    }
  }

  // ---------- 登录 ----------
  function setLogin(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    tokenRef.value = token;
    user.value = userData;
    loginDialogVisible.value = false;
  }

  // ---------- 获取个人信息（异步） ----------
  async function fetchUserInfo() {
    try {
      const res = await getProfile();
      user.value = res.data;
      localStorage.setItem("user", JSON.stringify(user.value));
    } catch {
      // 静默失败，保持当前用户信息
    }
  }

  // ---------- 退出登录 ----------
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    tokenRef.value = null;
    user.value = null;
  }

  // ---------- 更新个人信息 ----------
  function updateProfile(updatedData) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  }

  // ---------- 弹窗控制 ----------
  function openLogin() {
    loginDialogVisible.value = true;
  }
  function openRegister() {
    registerDialogVisible.value = true;
  }
  function openForgot() {
    forgotDialogVisible.value = true;
  }

  // 启动时恢复状态
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
