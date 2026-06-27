<!-- AI 生成，手动调整：字段名对齐 API.md，模拟邮箱验证流程提示 -->
<template>
  <el-dialog
    v-model="visible"
    title="找回密码"
    width="400px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="forgot-dialog"
  >
    <!-- 步骤一：输入邮箱 -->
    <template v-if="step === 1">
      <div class="forgot-header">
        <p class="forgot-subtitle">输入注册时使用的邮箱，我们将发送新密码</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="注册邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入注册邮箱"
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
            @click="handleSubmit"
          >
            {{ loading ? '发送中...' : '发送新密码' }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 步骤二：发送成功 -->
    <template v-else>
      <div class="success-box">
        <el-icon :size="48" color="#67c23a"><CircleCheckFilled /></el-icon>
        <h3 class="success-title">邮件已发送</h3>
        <p class="success-desc">
          新密码已发送至 <strong>{{ form.email }}</strong>，请查收邮件后重新登录。
        </p>
        <el-button type="primary" size="large" class="goto-login-btn" @click="switchToLogin">
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
import { ref, reactive, watch } from 'vue';
import { Message, CircleCheckFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { forgotPassword } from '@/api/auth';
import { useUserStore } from '@/store/useUserStore';

const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);
const step = ref(1);

// 通过 store 控制显隐
const visible = ref(false);
watch(() => userStore.forgotDialogVisible, (val) => {
  visible.value = val;
  // 每次打开时重置到第一步
  if (val) step.value = 1;
});
watch(visible, (val) => { userStore.forgotDialogVisible = val; });

const form = reactive({
  email: '',
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
};

// 提交忘记密码请求
async function handleSubmit() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await forgotPassword({ email: form.email });
    // 成功后进入第二步
    step.value = 2;
  } catch (error) {
    const msg = error.response?.data?.message || '发送失败，请检查邮箱是否正确';
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
