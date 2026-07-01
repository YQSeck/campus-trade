<!-- 【模块一：用户系统】忘记密码弹窗 - 验证码验证后自主设置新密码 -->
<!-- AI 生成：手动调整前请勿修改 -->
<template>
  <el-dialog
    v-model="visible"
    title="找回密码"
    width="400px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="forgot-dialog"
  >
    <!-- 步骤一：输入邮箱/手机号 获取验证码 -->
    <template v-if="step === 1">
      <div class="forgot-header">
        <p class="forgot-subtitle">输入注册时使用的邮箱或手机号，获取验证码</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleGetCode"
      >
        <el-form-item label="邮箱 / 手机号" prop="account">
          <el-input
            v-model="form.account"
            placeholder="请输入注册时的邮箱或手机号"
            :prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleGetCode"
          >
            {{ loading ? "发送中..." : "获取验证码" }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 步骤二：输入验证码 + 新密码 -->
    <template v-else-if="step === 2">
      <div class="forgot-header">
        <p class="forgot-subtitle">
          验证码已发送至 <strong>{{ form.account }}</strong>，请在终端查看
        </p>
      </div>

      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-position="top"
        @keyup.enter="handleReset"
      >
        <el-form-item label="验证码" prop="code">
          <el-input
            v-model="resetForm.code"
            placeholder="请输入6位验证码"
            maxlength="6"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="至少6位"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="再次输入新密码"
            show-password
            size="large"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleReset"
          >
            {{ loading ? "提交中..." : "重置密码" }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 重新获取验证码 -->
      <div class="resend-box">
        <span class="resend-text">没收到验证码？</span>
        <el-button link type="primary" :disabled="loading" @click="handleGetCode">
          重新获取
        </el-button>
      </div>
    </template>

    <!-- 步骤三：成功 -->
    <template v-else>
      <div class="success-box">
        <el-icon :size="48" color="#67c23a"><CircleCheckFilled /></el-icon>
        <h3 class="success-title">密码重置成功</h3>
        <p class="success-desc">请使用新密码重新登录</p>
        <el-button
          type="primary"
          size="large"
          class="goto-login-btn"
          @click="switchToLogin"
        >
          去登录
        </el-button>
      </div>
    </template>

    <!-- 底部链接（仅步骤一显示） -->
    <div v-if="step === 1" class="forgot-footer">
      <span>想起密码了？</span>
      <el-button link type="primary" @click="switchToLogin">去登录</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { Message, CircleCheckFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { forgotPassword, resetPassword } from "@/api/auth";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const formRef = ref(null);
const resetFormRef = ref(null);
const loading = ref(false);
const step = ref(1);

// 通过 store 控制显隐
const visible = ref(false);
watch(
  () => userStore.forgotDialogVisible,
  (val) => {
    visible.value = val;
    if (val) step.value = 1;
  },
);
watch(visible, (val) => {
  userStore.forgotDialogVisible = val;
});

// 第一步表单
const form = reactive({
  account: "",
});

const rules = {
  account: [
    { required: true, message: "请输入邮箱或手机号", trigger: "blur" },
  ],
};

// 获取验证码
async function handleGetCode() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await forgotPassword({ email: form.account });
    step.value = 2;
    ElMessage.success("验证码已发送，请在终端查看");
  } catch (error) {
    const msg = error.response?.data?.message || "发送失败，请检查账号是否正确";
    ElMessage.error(msg);
  } finally {
    loading.value = false;
  }
}

// 第二步表单
const resetForm = reactive({
  code: "",
  newPassword: "",
  confirmPassword: "",
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const resetRules = {
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "验证码为6位数字", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
};

// 提交重置密码
async function handleReset() {
  if (!resetFormRef.value) return;
  const valid = await resetFormRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await resetPassword({
      email: form.account,
      code: resetForm.code,
      newPassword: resetForm.newPassword,
    });
    step.value = 3;
  } catch (error) {
    const msg = error.response?.data?.message || "重置失败";
    ElMessage.error(msg);
  } finally {
    loading.value = false;
  }
}

// 切换到登录
function switchToLogin() {
  userStore.forgotDialogVisible = false;
  userStore.loginDialogVisible = true;
}
</script>

<style scoped>
.forgot-dialog .forgot-header {
  text-align: center;
  margin-bottom: 8px;
}

.forgot-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
}

.resend-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.resend-text {
  color: var(--text-tertiary, #999);
}

.success-box {
  text-align: center;
  padding: 20px 0;
}

.success-title {
  margin: 16px 0 8px;
  color: var(--text-primary);
  font-size: 18px;
}

.success-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.goto-login-btn {
  width: 100%;
}

.forgot-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  padding-top: 4px;
}
</style>
