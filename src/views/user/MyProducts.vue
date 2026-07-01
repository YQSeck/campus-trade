<template>
  <div class="my-products-page">
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="left-section">
          <el-button link @click="$router.push('/')">
            <el-icon><ArrowLeft /></el-icon>返回首页
          </el-button>
          <h1 class="page-title">我的发布</h1>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="tab-bar">
        <el-radio-group v-model="statusFilter" size="small" @change="fetchMyProducts">
          <el-radio-button value="active">在售中</el-radio-button>
          <el-radio-button value="removed">已下架</el-radio-button>
          <el-radio-button value="">全部</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="loading" class="loading-box">
        <el-icon class="is-loading" :size="28"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <el-empty v-else-if="products.length === 0" description="暂无发布商品">
        <el-button type="primary" @click="$router.push('/publish')">去发布</el-button>
      </el-empty>

      <div v-else class="product-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          <div class="item-image" @click="$router.push(`/product/${product.id}`)">
            <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.title" />
            <div v-else class="placeholder-img">暂无图片</div>
            <span v-if="product.status === 'removed'" class="removed-overlay">已下架</span>
          </div>

          <div class="item-info" @click="$router.push(`/product/${product.id}`)">
            <h3 class="item-title">{{ product.title }}</h3>
            <div class="item-meta">
              <el-tag size="small" type="info">{{ product.category }}</el-tag>
              <span class="item-price">¥{{ product.price }}</span>
              <span class="item-date">{{ formatDate(product.createdAt) }}</span>
            </div>
          </div>

          <div class="item-actions">
            <el-button size="small" @click="goEdit(product.id)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>

            <el-button
              v-if="product.status === 'active'"
              size="small"
              type="warning"
              @click="handleToggleStatus(product)"
            >
              <el-icon><Remove /></el-icon>下架
            </el-button>
            <el-button v-else size="small" type="success" @click="handleToggleStatus(product)">
              <el-icon><Check /></el-icon>上架
            </el-button>

            <el-button size="small" type="danger" @click="handleDelete(product)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/userStore';
import { ArrowLeft, Loading, Edit, Remove, Check, Delete } from '@element-plus/icons-vue';
import { getProducts, updateProduct, deleteProduct } from '@/api/product';

const router = useRouter();
const userStore = useUserStore();
const products = ref([]);
const loading = ref(false);
const statusFilter = ref('active');

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN');
}

async function fetchMyProducts() {
  loading.value = true;
  try {
    const params = { mine: true, limit: 50 };
    if (statusFilter.value) params.status = statusFilter.value;
    const res = await getProducts(params);
    products.value = res.data.products;
  } catch {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
}

function goEdit(id) {
  router.push(`/publish?edit=${id}`);
}

async function handleToggleStatus(product) {
  const newStatus = product.status === 'active' ? 'removed' : 'active';
  const actionText = newStatus === 'active' ? '上架' : '下架';
  try {
    await ElMessageBox.confirm(`确认${actionText}「${product.title}」？`, '提示');
  } catch {
    return;
  }
  try {
    await updateProduct(product.id, { status: newStatus });
    ElMessage.success(`${actionText}成功`);
    fetchMyProducts();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || `${actionText}失败`);
  }
}

async function handleDelete(product) {
  try {
    await ElMessageBox.confirm(`确认删除「${product.title}」？此操作不可撤销。`, '警告', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  try {
    await deleteProduct(product.id);
    ElMessage.success('已删除');
    fetchMyProducts();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败');
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/');
    return;
  }
  fetchMyProducts();
});
</script>

<style scoped>
.my-products-page {
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
  max-width: 960px;
  margin: 20px auto;
  padding: 0 24px;
}

.tab-bar {
  margin-bottom: 16px;
}

.loading-box {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.item-image {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: #f0f2f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.removed-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 13px;
  background: #f5f5f5;
}

.item-info {
  flex: 1;
  min-width: 200px;
  cursor: pointer;
}

.item-title {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 600;
  margin: 0 0 8px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.item-price {
  font-size: 16px;
  color: var(--danger-color);
  font-weight: 700;
}

.item-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
