<!-- AI 生成，手动调整：搜索/分类筛选/价格排序/分页/商品卡片/登录后弹窗全部整合 -->
<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <h1 class="logo" @click="refreshList">CampusTrade</h1>
        <div class="top-actions">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-dropdown-trigger">
                <el-avatar :size="32" :src="userStore.user?.avatarUrl">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <span class="user-name">{{ userStore.user?.nickname }}</span>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="myProducts">
                    <el-icon><Goods /></el-icon>我的发布
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" size="small" class="publish-btn" @click="goPublish">
              <el-icon><Plus /></el-icon>发布商品
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="userStore.openLogin()">
              登录
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 搜索与筛选区 -->
    <div class="search-section">
      <div class="search-inner">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品标题或描述..."
          :prefix-icon="Search"
          size="large"
          clearable
          class="search-input"
          @input="onSearchInput"
        />
        <div class="filter-row">
          <div class="category-filters">
            <el-button
              :type="selectedCategory === '' ? 'primary' : 'default'"
              size="small"
              @click="filterByCategory('')"
            >
              全部
            </el-button>
            <el-button
              v-for="cat in categories"
              :key="cat"
              :type="selectedCategory === cat ? 'primary' : 'default'"
              size="small"
              @click="filterByCategory(cat)"
            >
              {{ cat }}
            </el-button>
          </div>
          <div class="sort-btn">
            <el-button
              :type="priceOrder ? 'warning' : 'default'"
              size="small"
              @click="togglePriceOrder"
            >
              <el-icon><Sort /></el-icon>
              {{ priceOrder === 'asc' ? '价格 ↑' : priceOrder === 'desc' ? '价格 ↓' : '价格排序' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <main class="main-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-box">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>正在加载商品...</p>
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="products.length === 0" description="暂无商品" />

      <!-- 商品卡片网格 -->
      <div v-else class="product-grid">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="goDetail(product.id)"
        >
          <div class="card-image">
            <img
              v-if="product.images?.[0]"
              :src="product.images[0]"
              :alt="product.title"
            />
            <div v-else class="placeholder-img">暂无图片</div>
            <span v-if="product.originalPrice && product.price < product.originalPrice" class="discount-badge">
              {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
            </span>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ product.title }}</h3>
            <p class="card-desc">{{ product.description }}</p>
            <div class="card-meta">
              <span class="card-category">
                <el-tag size="small" type="info">{{ product.category }}</el-tag>
              </span>
              <span class="card-condition">{{ product.condition }}成新</span>
            </div>
            <div class="card-bottom">
              <span class="card-price">
                <span class="price-symbol">¥</span>{{ product.price }}
              </span>
              <span class="card-seller">{{ product.sellerSchool }} · {{ product.sellerNickname }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchProducts"
        />
      </div>
    </main>

    <!-- 弹窗 -->
    <LoginDialog />
    <RegisterDialog />
    <ForgotPassword />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  UserFilled, ArrowDown, User, Goods, SwitchButton, Plus,
  Search, Sort, Loading,
} from '@element-plus/icons-vue';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { useUserStore } from '@/store/useUserStore';
import { getProducts } from '@/api/product';
import LoginDialog from '@/components/LoginDialog.vue';
import RegisterDialog from '@/components/RegisterDialog.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';

const router = useRouter();
const userStore = useUserStore();

// 商品数据
const products = ref([]);
const total = ref(0);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 10;

// 搜索与筛选
const searchKeyword = ref('');
const selectedCategory = ref('');
const priceOrder = ref(''); // 'asc' | 'desc' | ''
const categories = PRODUCT_CATEGORIES;
let searchTimer = null;

// 获取商品列表
async function fetchProducts() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize,
    };
    if (searchKeyword.value) params.search = searchKeyword.value;
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (priceOrder.value) params.priceOrder = priceOrder.value;

    const res = await getProducts(params);
    products.value = res.data.products;
    total.value = res.data.total;
  } catch {
    ElMessage.error('加载商品失败');
  } finally {
    loading.value = false;
  }
}

// 搜索输入防抖
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 400);
}

// 分类筛选
function filterByCategory(cat) {
  selectedCategory.value = cat;
  currentPage.value = 1;
  fetchProducts();
}

// 价格排序切换
function togglePriceOrder() {
  if (!priceOrder.value) priceOrder.value = 'asc';
  else if (priceOrder.value === 'asc') priceOrder.value = 'desc';
  else priceOrder.value = '';
  currentPage.value = 1;
  fetchProducts();
}

// 刷新列表
function refreshList() {
  searchKeyword.value = '';
  selectedCategory.value = '';
  priceOrder.value = '';
  currentPage.value = 1;
  fetchProducts();
}

// 跳转详情
function goDetail(id) {
  router.push(`/product/${id}`);
}

// 发布商品
function goPublish() {
  if (!userStore.isLoggedIn) {
    userStore.openLogin();
    return;
  }
  router.push('/publish');
}

// 下拉菜单
function handleCommand(command) {
  if (command === 'profile') router.push('/profile');
  else if (command === 'myProducts') {
    router.push('/my-products');
  } else if (command === 'logout') {
    userStore.logout();
    router.push('/');
  }
}

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

/* ---- 导航栏 ---- */
.top-bar {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-dropdown-trigger:hover {
  background: #f0f2f5;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ---- 搜索区 ---- */
.search-section {
  background: #fff;
  padding: 16px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.search-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.search-input {
  max-width: 520px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.category-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ---- 主内容 ---- */
.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 20px auto;
  padding: 0 24px;
}

.loading-box {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.loading-box p {
  margin-top: 12px;
  font-size: 14px;
}

/* ---- 商品网格 ---- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f0f2f5;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--danger-color);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.card-body {
  padding: 14px 16px;
}

.card-title {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 600;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-condition {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.card-price {
  font-size: 20px;
  color: var(--danger-color);
  font-weight: 700;
}

.price-symbol {
  font-size: 14px;
}

.card-seller {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ---- 分页 ---- */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-bottom: 32px;
}
</style>
