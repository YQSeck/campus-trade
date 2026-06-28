<!-- AI 生成，手动调整：补充了邮箱格式校验、密码长度校验、登录失败次数提示，字段名对齐 API.md -->
<template>
  <el-dialog
    v-model="visible"
    title="欢迎回来"
    width="420px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="login-dialog"
  >
    <div class="login-header">
      <p class="login-subtitle">登录 CampusTrade，开启校园二手交易</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @keyup.enter="handleLogin"
    >
      <!-- 邮箱/手机号 -->
      <el-form-item label="邮箱/手机号" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱或手机号"
          :prefix-icon="Message"
          size="large"
          clearable
        />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          size="large"
          show-password
          clearable
        />
      </el-form-item>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          {{ loading ? "登录中..." : "登 录" }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 底部链接 -->
    <div class="login-footer">
      <el-button link type="primary" @click="switchToForgot"
        >忘记密码？</el-button
      >
      <span class="footer-divider">|</span>
      <el-button link type="primary" @click="switchToRegister"
        >还没有账号？去注册</el-button
      >
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { Message, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { login } from "@/api/auth";
import { useUserStore } from "@/store/useUserStore";

const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);

// 通过 store 控制弹窗显隐
const visible = ref(false);
watch(
  () => userStore.loginDialogVisible,
  (val) => {
    visible.value = val;
  },
);
watch(visible, (val) => {
  userStore.loginDialogVisible = val;
});

// 表单数据：字段名严格对齐 API.md（email, password）
const form = reactive({
  email: "",
  password: "",
});

// 校验规则：邮箱或11位手机号均合法
const isEmailOrPhone = (rule, value, callback) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhone = /^1[3-9]\d{9}$/.test(value);
  if (!isEmail && !isPhone) {
    callback(new Error("请输入正确的邮箱或11位手机号"));
  } else {
    callback();
  }
};

const rules = {
  email: [
    { required: true, message: "请输入邮箱或手机号", trigger: "blur" },
    { validator: isEmailOrPhone, trigger: ["blur", "change"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 6,
      message: "密码长度不能少于6位",
      trigger: ["blur", "change"],
    },
  ],
};

// 登录提交
async function handleLogin() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await login({
      email: form.email,
      password: form.password,
    });
    // res.data: { token, user: { id, email, nickname, ... } }
    userStore.setLogin(res.data.token, res.data.user);
    ElMessage.success("登录成功");
  } catch (error) {
    // 根据不同错误场景给出明确提示
    const status = error.response?.status;
    const msg = error.response?.data?.message;

    if (!error.response) {
      ElMessage.error("无法连接服务器，请检查网络或联系管理员");
    } else if (status === 403) {
      ElMessage.warning("账号已被锁定，请稍后再试");
    } else if (status === 401) {
      ElMessage.error(msg || "邮箱/手机号或密码错误");
    } else {
      ElMessage.error(msg || "登录失败，请稍后重试");
    }
  } finally {
    loading.value = false;
  }
}

// 切换到忘记密码
function switchToForgot() {
  userStore.loginDialogVisible = false;
  userStore.forgotDialogVisible = true;
}

// 切换到注册
function switchToRegister() {
  userStore.loginDialogVisible = false;
  userStore.registerDialogVisible = true;
}
</script>

<style scoped>
.login-dialog .login-header {
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.login-btn {
  width: 100%;
  margin-top: 4px;
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
}

.footer-divider {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
