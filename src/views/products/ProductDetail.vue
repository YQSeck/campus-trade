<!-- AI 生成，手动调整：商品详情+图片轮播+卖家信息+编辑入口，移除留言和「我想要」（属模块3） -->
<template>
  <div class="detail-page">
    <header class="top-bar">
      <div class="top-bar-inner">
        <el-button link @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <span class="seller-info" v-if="product">
          {{ product.sellerSchool }} · {{ product.sellerNickname }}
        </span>
        <div></div>
      </div>
    </header>

    <main class="main-content" v-if="product">
      <div class="detail-card">
        <!-- 图片 -->
        <div class="image-section">
          <div class="image-main">
            <img
              v-if="product.images?.length"
              :src="product.images[currentImageIndex]"
              :alt="product.title"
              class="main-image"
            />
            <div v-else class="no-image">暂无图片</div>
            <template v-if="(product.images?.length || 0) > 1">
              <button class="img-arrow img-arrow-left" @click="prevImage">‹</button>
              <button class="img-arrow img-arrow-right" @click="nextImage">›</button>
            </template>
          </div>
          <div v-if="(product.images?.length || 0) > 1" class="image-thumbs">
            <div
              v-for="(img, idx) in product.images"
              :key="idx"
              :class="['thumb-item', { active: currentImageIndex === idx }]"
              @click="currentImageIndex = idx"
            >
              <img :src="img" :alt="`图片${idx + 1}`" />
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="info-section">
          <div class="info-header">
            <h1 class="product-title">{{ product.title }}</h1>
            <el-tag>{{ product.category }}</el-tag>
          </div>

          <div class="price-row">
            <span class="price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">
              原价 ¥{{ product.originalPrice }}
            </span>
            <span class="condition">{{ product.condition }}成新</span>
          </div>

          <div class="seller-row">
            <el-avatar :size="40">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="seller-detail">
              <div class="seller-name">{{ product.sellerNickname }}</div>
              <div class="seller-school">{{ product.sellerSchool }}</div>
            </div>
          </div>

          <!-- 卖家本人可编辑 -->
          <div class="action-row" v-if="canEdit">
            <el-button type="primary" @click="goEdit">编辑商品</el-button>
          </div>

          <!-- 商品描述 -->
          <div class="desc-section">
            <h3>商品描述</h3>
            <p class="desc-text">{{ product.description }}</p>
            <p class="publish-time">发布于 {{ formatDate(product.createdAt) }}</p>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="loading-box">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
// AI 生成，手动调整：仅保留商品展示和卖家编辑入口，移除留言/我想要（属模块3职责）
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, UserFilled, Loading } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/useUserStore';
import { getProductDetail } from '@/api/product';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const product = ref(null);
const currentImageIndex = ref(0);

function prevImage() {
  if (!product.value?.images) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length;
}
function nextImage() {
  if (!product.value?.images) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
}

const canEdit = computed(() => {
  if (!userStore.isLoggedIn || !product.value) return false;
  return userStore.user?.id === product.value.sellerId;
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return d.toLocaleDateString('zh-CN');
}

async function fetchDetail() {
  try {
    const res = await getProductDetail(route.params.id);
    product.value = res.data.product;
  } catch (error) {
    ElMessage.error('商品不存在或已删除');
    router.push('/');
  }
}

function goEdit() {
  router.push(`/publish?edit=${product.value.id}`);
}

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.detail-page { min-height: 100vh; background: var(--bg-color); }

.top-bar {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
}
.top-bar-inner {
  width: 100%; max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
}
.seller-info { font-size: 14px; color: var(--text-secondary); }

.main-content { max-width: 960px; margin: 24px auto; padding: 0 24px; }

.detail-card {
  background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
  overflow: hidden; display: flex; flex-wrap: wrap;
}

.image-section { width: 400px; min-height: 300px; background: #f0f2f5; display: flex; flex-direction: column; }
.image-main { position: relative; width: 100%; height: 300px; }
.main-image { width: 100%; height: 100%; object-fit: cover; }

.img-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.35); color: #fff; border: none;
  width: 32px; height: 48px; font-size: 24px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; z-index: 2;
}
.img-arrow:hover { background: rgba(0,0,0,0.55); }
.img-arrow-left { left: 0; border-radius: 0 6px 6px 0; }
.img-arrow-right { right: 0; border-radius: 6px 0 0 6px; }

.image-thumbs { display: flex; gap: 6px; padding: 8px; overflow-x: auto; }
.thumb-item {
  width: 52px; height: 52px; border-radius: 4px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent; flex-shrink: 0;
  transition: border-color 0.2s;
}
.thumb-item.active { border-color: var(--primary-color); }
.thumb-item img { width: 100%; height: 100%; object-fit: cover; }

.no-image {
  width: 100%; height: 300px; display: flex;
  align-items: center; justify-content: center; color: var(--text-secondary);
}

.info-section { flex: 1; min-width: 300px; padding: 24px; display: flex; flex-direction: column; }
.info-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.product-title { font-size: 22px; color: var(--text-primary); font-weight: 700; margin: 0; line-height: 1.4; flex: 1; }

.price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
.price { font-size: 28px; color: var(--danger-color); font-weight: 700; }
.original-price { font-size: 14px; color: var(--text-secondary); text-decoration: line-through; }
.condition { font-size: 13px; color: var(--primary-color); font-weight: 500; }

.seller-row {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 0; border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color); margin-bottom: 16px;
}
.seller-name { font-size: 15px; color: var(--text-primary); font-weight: 500; }
.seller-school { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }

.action-row { margin-bottom: 20px; }

.desc-section { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); }
.desc-section h3 { font-size: 16px; color: var(--text-primary); margin-bottom: 8px; }
.desc-text { font-size: 14px; color: var(--text-primary); line-height: 1.8; white-space: pre-wrap; }
.publish-time { font-size: 12px; color: var(--text-secondary); margin-top: 12px; }

.loading-box { text-align: center; padding: 80px 0; color: var(--text-secondary); }
</style>
