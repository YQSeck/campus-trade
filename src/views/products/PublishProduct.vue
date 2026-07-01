<!-- 【模块二：商品发布与管理】发布/编辑商品 -->
<!-- AI 生成：手动调整前请勿修改 -->
<template>
  <div class="publish-page">
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="left-section">
          <el-button link @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <h1 class="page-title">{{ isEdit ? "编辑商品" : "发布商品" }}</h1>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="left"
        >
          <!-- 标题 -->
          <el-form-item label="商品标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入商品标题"
              maxlength="50"
              show-word-limit
              size="large"
            />
          </el-form-item>

          <!-- 分类 -->
          <el-form-item label="分类" prop="category">
            <el-select
              v-model="form.category"
              placeholder="请选择分类"
              size="large"
              class="full-width"
            >
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="详细描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="描述商品的使用情况、购买时间、配件等..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 价格 & 原价 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="售价" prop="price">
                <el-input-number
                  v-model="form.price"
                  :min="0"
                  :precision="0"
                  placeholder="0"
                  size="large"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原价">
                <el-input-number
                  v-model="form.originalPrice"
                  :min="0"
                  :precision="0"
                  placeholder="选填"
                  size="large"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 成色 -->
          <el-form-item label="成色">
            <div class="condition-wrap">
              <el-slider
                v-model="form.condition"
                :min="1"
                :max="10"
                show-stops
                class="condition-slider"
              />
              <span class="condition-label">{{ form.condition }}成新</span>
            </div>
          </el-form-item>

          <!-- 本地图片上传 -->
          <el-form-item label="商品图片">
            <div class="images-section">
              <!-- 已选图片预览 -->
              <div
                v-for="(img, idx) in form.images"
                :key="idx"
                class="image-item"
              >
                <img :src="img" alt="商品图片" class="preview-img" />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  class="remove-img-btn"
                  @click="removeImage(idx)"
                />
              </div>
              <!-- 添加按钮 -->
              <div
                v-if="form.images.length < 6"
                class="add-image-box"
                @click="openFilePicker"
              >
                <el-icon :size="28"><Plus /></el-icon>
                <span>添加图片</span>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <p class="upload-tip">
              支持 JPG/PNG/GIF，单张自动压缩至 2MB 以内，最多 6 张
              <span v-if="imageProcessing" style="color: var(--primary-color)">
                处理中...</span
              >
            </p>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="handleSubmit"
            >
              {{ submitting ? "提交中..." : isEdit ? "保存修改" : "发布商品" }}
            </el-button>
            <el-button size="large" @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft, Plus, Delete } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/userStore";
import { createProduct, updateProduct, getProductDetail } from "@/api/product";
import { compressImage } from "@/utils/image";
import { PRODUCT_CATEGORIES } from "@/constants/categories";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const fileInput = ref(null);
const submitting = ref(false);
const imageProcessing = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const categories = PRODUCT_CATEGORIES;

const form = reactive({
  title: "",
  category: "",
  description: "",
  price: null,
  originalPrice: null,
  condition: 9,
  images: [],
});

const rules = {
  title: [
    { required: true, message: "请输入商品标题", trigger: "blur" },
    { min: 2, max: 50, message: "标题长度为2~50个字符", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  description: [
    { required: true, message: "请输入商品描述", trigger: "blur" },
    { min: 10, message: "描述至少10个字", trigger: "blur" },
  ],
  price: [{ required: true, message: "请输入售价", trigger: "blur" }],
};

// 打开本地文件选择器
function openFilePicker() {
  fileInput.value.click();
}

// 处理本地图片选择
async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件");
    fileInput.value.value = "";
    return;
  }

  if (form.images.length >= 6) {
    ElMessage.warning("最多上传6张图片");
    fileInput.value.value = "";
    return;
  }

  imageProcessing.value = true;
  try {
    const base64 = await compressImage(file, 2, 1920);
    form.images.push(base64);
  } catch {
    ElMessage.error("图片处理失败，请重试");
  } finally {
    imageProcessing.value = false;
    fileInput.value.value = "";
  }
}

// 移除图片
function removeImage(idx) {
  form.images.splice(idx, 1);
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isEdit.value && editId.value) {
      await updateProduct(editId.value, {
        title: form.title,
        category: form.category,
        description: form.description,
        price: form.price,
        originalPrice: form.originalPrice,
        condition: form.condition,
        images: form.images,
      });
      ElMessage.success("修改已保存");
    } else {
      await createProduct({
        title: form.title,
        category: form.category,
        description: form.description,
        price: form.price,
        originalPrice: form.originalPrice,
        condition: form.condition,
        images: form.images,
      });
      ElMessage.success("商品发布成功");
    }
    router.push("/");
  } catch (error) {
    const msg = error.response?.data?.message || "操作失败，请重试";
    ElMessage.error(msg);
  } finally {
    submitting.value = false;
  }
}

// 如果是编辑模式，加载已有数据
onMounted(async () => {
  // 鉴权检查
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/");
    return;
  }

  const id = route.query.edit;
  if (id) {
    isEdit.value = true;
    editId.value = parseInt(id);
    try {
      const res = await getProductDetail(id);
      const p = res.data.product;
      form.title = p.title;
      form.category = p.category;
      form.description = p.description;
      form.price = p.price;
      form.originalPrice = p.originalPrice;
      form.condition = p.condition || 9;
      form.images = p.images || [];
    } catch {
      ElMessage.error("加载商品信息失败");
      router.push("/");
    }
  }
});
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: var(--bg-color);
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
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
}

.main-content {
  max-width: 720px;
  margin: 24px auto;
  padding: 0 24px;
}

.form-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
}

.full-width {
  width: 100%;
}

.condition-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.condition-slider {
  flex: 1;
}

.condition-label {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  white-space: nowrap;
  min-width: 50px;
}

/* 图片区域 */
.images-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img-btn {
  position: absolute;
  top: 2px;
  right: 2px;
}

.add-image-box {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
  transition: border-color 0.2s;
}

.add-image-box:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}
</style>
