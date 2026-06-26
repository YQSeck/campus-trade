<!-- AI 生成，手动调整：字段名对齐 API.md（email/password/nickname/school），密码确认校验 -->
<template>
  <el-dialog
    v-model="visible"
    title="创建账号"
    width="440px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="register-dialog"
  >
    <div class="register-header">
      <p class="register-subtitle">加入 CampusTrade，发现校园好物</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @keyup.enter="handleRegister"
    >
      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱地址"
          :prefix-icon="Message"
          size="large"
          clearable
        />
      </el-form-item>

      <!-- 昵称 -->
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="form.nickname"
          placeholder="给自己起个名字"
          :prefix-icon="User"
          size="large"
          clearable
        />
      </el-form-item>

      <!-- 学校 -->
      <el-form-item label="学校" prop="school">
        <el-input
          v-model="form.school"
          placeholder="请输入学校名称"
          :prefix-icon="School"
          size="large"
          clearable
        />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="至少6位密码"
          :prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="再次输入密码"
          :prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="register-btn"
          @click="handleRegister"
        >
          {{ loading ? '注册中...' : '注 册' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 底部链接 -->
    <div class="register-footer">
      <span>已有账号？</span>
      <el-button link type="primary" @click="switchToLogin">去登录</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Message, Lock, User, School } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { register } from '@/api/auth';
import { useUserStore } from '@/store/useUserStore';

const userStore = useUserStore();
const formRef = ref(null);
const loading = ref(false);

// 通过 store 控制显隐
const visible = ref(false);
watch(() => userStore.registerDialogVisible, (val) => { visible.value = val; });
watch(visible, (val) => { userStore.registerDialogVisible = val; });

// 表单字段：与 API.md POST /api/auth/register 完全一致
const form = reactive({
  email: '',
  nickname: '',
  school: '',
  password: '',
  confirmPassword: '',
});

// 校验规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2~20个字符', trigger: 'blur' },
  ],
  school: [
    { required: true, message: '请输入学校名称', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

// 注册提交
async function handleRegister() {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await register({
      email: form.email,
      password: form.password,
      nickname: form.nickname,
      school: form.school,
    });
    ElMessage.success('注册成功，请登录');
    // 注册成功后切换到登录弹窗
    userStore.registerDialogVisible = false;
    userStore.loginDialogVisible = true;
  } catch (error) {
    // 根据不同错误场景给出明确提示
    const status = error.response?.status;
    const msg = error.response?.data?.message;

    if (!error.response) {
      // 网络不通或后端未启动
      ElMessage.error('无法连接服务器，请检查网络或联系管理员');
    } else if (status === 409) {
      ElMessage.warning(msg || '该邮箱已被注册');
    } else if (status === 400) {
      ElMessage.warning(msg || '请完善注册信息');
    } else {
      ElMessage.error(msg || '注册失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
}

// 切换到登录
function switchToLogin() {
  userStore.registerDialogVisible = false;
  userStore.loginDialogVisible = true;
}
</script>

<style scoped>
.register-dialog .register-header {
  text-align: center;
  margin-bottom: 8px;
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.register-btn {
  width: 100%;
  margin-top: 4px;
}

.register-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  padding-top: 4px;
}
</style>
