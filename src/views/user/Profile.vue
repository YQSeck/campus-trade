<!-- 【模块一/四】个人中心（含信誉分展示） -->
<!-- AI 生成：手动调整前请勿修改 -->
<template>
  <div class="profile-page">
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="left-section">
          <el-button link class="back-btn" @click="$router.push('/')">
            <el-icon><ArrowLeft /></el-icon>返回首页
          </el-button>
          <h1 class="logo" @click="$router.push('/')">CampusTrade</h1>
        </div>
        <div class="top-actions">
          <span class="welcome-text">你好，{{ userStore.user?.nickname }}</span>
          <el-button type="danger" size="small" plain @click="handleLogout"
            >退出登录</el-button
          >
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="profile-card">
        <h2 class="card-title">个人信息</h2>

        <!-- 头像区域 -->
        <div class="avatar-section">
          <el-avatar :size="80" :src="form.avatarUrl">
            <el-icon :size="40"><UserFilled /></el-icon>
          </el-avatar>
          <div class="avatar-actions">
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            />
            <el-button
              size="small"
              type="primary"
              plain
              :loading="avatarUploading"
              @click="avatarInput.click()"
            >
              {{ avatarUploading ? "处理中..." : "更换头像" }}
            </el-button>
            <p class="upload-tip">支持 JPG/PNG/GIF，自动压缩至 2MB 以内</p>
          </div>
        </div>

        <!-- 信息编辑表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          label-position="left"
          class="info-form"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱地址"
              clearable
            />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="form.nickname"
              placeholder="给自己起个名字"
              clearable
            />
          </el-form-item>

          <el-form-item label="学校" prop="school">
            <el-input
              v-model="form.school"
              placeholder="请输入学校名称"
              clearable
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号（可选）"
              clearable
            />
          </el-form-item>

          <el-form-item label="联系方式" prop="contact">
            <el-input
              v-model="form.contact"
              placeholder="手机号或微信号（可选）"
              clearable
            />
          </el-form-item>

          <el-form-item label="公开联系方式">
            <el-switch
              v-model="form.contactVisible"
              active-text="公开"
              inactive-text="隐藏"
            />
          </el-form-item>

          <el-form-item label="信誉分">
            <span class="reputation-score"
              >{{ userStore.user?.reputationScore || 100 }} 分</span
            >
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSave">
              {{ saving ? "保存中..." : "保存修改" }}
            </el-button>
            <el-button @click="resetForm">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 修改密码 -->
      <div class="profile-card">
        <h2 class="card-title">修改密码</h2>
        <el-form
          ref="pwdFormRef"
          :model="pwdForm"
          :rules="pwdRules"
          label-width="80px"
          label-position="left"
          class="info-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input
              v-model="pwdForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="pwdForm.newPassword"
              type="password"
              placeholder="至少6位新密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="pwdForm.confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="warning"
              :loading="changingPwd"
              @click="handleChangePassword"
            >
              {{ changingPwd ? "修改中..." : "修改密码" }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, UserFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/userStore";
import { updateProfile, changePassword } from "@/api/auth";
import { compressImage } from "@/utils/image";

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const pwdFormRef = ref(null);
const avatarInput = ref(null);
const saving = ref(false);
const changingPwd = ref(false);
const avatarUploading = ref(false);

// 个人信息表单
const form = reactive({
  email: "",
  nickname: "",
  school: "",
  phone: "",
  contact: "",
  avatarUrl: "",
  contactVisible: true,
});

// 密码表单
const pwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const rules = {
  email: [
    {
      pattern: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "请输入正确的邮箱格式",
      trigger: ["blur", "change"],
    },
  ],
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度为2~20个字符", trigger: "blur" },
  ],
  school: [{ required: true, message: "请输入学校名称", trigger: "blur" }],
  phone: [
    {
      pattern: /^(1[3-9]\d{9})?$/,
      message: "请输入正确的11位手机号",
      trigger: ["blur", "change"],
    },
  ],
  contact: [
    {
      pattern: /^$|^1[3-9]\d{9}$|^[a-zA-Z0-9_-]+$/,
      message: "请输入有效手机号或微信号",
      trigger: "blur",
    },
  ],
};

const validateNewPassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error("密码长度不能少于6位"));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const pwdRules = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { validator: validateNewPassword, trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
};

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push("/");
    return;
  }
  const user = userStore.user;
  if (user) {
    form.email = user.email || "";
    form.nickname = user.nickname || "";
    form.school = user.school || "";
    form.phone = user.phone || "";
    form.contact = user.contact || "";
    form.avatarUrl = user.avatarUrl || "";
    form.contactVisible = user.contactVisible !== false;
  }
});

// ======================== 头像上传（本地压缩）========================
async function handleAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 校验类型
  if (!file.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件");
    avatarInput.value.value = "";
    return;
  }

  avatarUploading.value = true;
  try {
    // 压缩并转 base64
    const base64 = await compressImage(file, 2, 800);
    form.avatarUrl = base64;

    // 先同步持久化到后端，再更新本地缓存
    await updateProfile({ avatarUrl: base64 });
    userStore.updateProfile({ avatarUrl: base64 });
    ElMessage.success("头像已更新");
  } catch {
    ElMessage.error("图片处理失败，请重试");
  } finally {
    avatarUploading.value = false;
    avatarInput.value.value = "";
  }
}

// 保存个人信息
async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    await updateProfile({
      email: form.email || undefined,
      nickname: form.nickname,
      school: form.school,
      phone: form.phone || undefined,
      contact: form.contact,
      avatarUrl: form.avatarUrl,
      contactVisible: form.contactVisible,
    });
    userStore.updateProfile({
      email: form.email || undefined,
      nickname: form.nickname,
      school: form.school,
      phone: form.phone || undefined,
      contact: form.contact,
      avatarUrl: form.avatarUrl,
      contactVisible: form.contactVisible,
    });
    ElMessage.success("个人信息已更新");
  } catch (error) {
    const msg = error.response?.data?.message || "保存失败，请重试";
    ElMessage.error(msg);
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  const user = userStore.user;
  if (user) {
    form.email = user.email || "";
    form.nickname = user.nickname || "";
    form.school = user.school || "";
    form.phone = user.phone || "";
    form.contact = user.contact || "";
    form.avatarUrl = user.avatarUrl || "";
    form.contactVisible = user.contactVisible !== false;
  }
}

async function handleChangePassword() {
  if (!pwdFormRef.value) return;
  const valid = await pwdFormRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    await ElMessageBox.confirm("确认修改密码？", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  changingPwd.value = true;
  try {
    await changePassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    ElMessage.success("密码修改成功，请重新登录");
    userStore.logout();
    router.push("/");
  } catch (error) {
    const msg = error.response?.data?.message || "密码修改失败";
    ElMessage.error(msg);
  } finally {
    changingPwd.value = false;
  }
}

function handleLogout() {
  userStore.logout();
  router.push("/");
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
}

.top-bar-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.logo {
  font-size: 20px;
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
  margin: 0;
}

.welcome-text {
  margin-right: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.main-content {
  flex: 1;
  max-width: 680px;
  width: 100%;
  margin: 24px auto;
  padding: 0 24px;
}

.profile-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.info-form {
  max-width: 480px;
}

.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 8px;
}

.reputation-score {
  font-size: 16px;
  color: var(--warning-color);
  font-weight: 600;
}
</style>
