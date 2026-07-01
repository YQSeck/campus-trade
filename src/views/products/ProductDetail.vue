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
        <div class="image-section">
          <div class="image-main">
            <img
              v-if="product.images?.length"
              :src="product.images[currentImageIndex]"
              :alt="product.title"
              class="main-image"
              @click="openPreview"
              title="点击查看大图"
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

          <div class="action-row" v-if="canEdit">
            <el-button type="primary" @click="goEdit">编辑商品</el-button>
          </div>

          <div
            class="action-row"
            v-else-if="product.status === 'active' && product.sellerId !== userStore.user?.id"
          >
            <el-button type="danger" size="large" :loading="ordering" @click="handleWant">
              我想要
            </el-button>
            <el-button plain @click="handleReport">举报</el-button>
          </div>

          <div v-if="product.sellerContact" class="contact-row">
            卖家联系方式：{{ product.sellerContact }}
          </div>

          <div class="desc-section">
            <h3>商品描述</h3>
            <p class="desc-text">{{ product.description }}</p>
            <p class="publish-time">发布于 {{ formatDate(product.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div class="comments-section">
        <h3>商品留言</h3>
        <div v-for="c in comments" :key="c.id" :class="['comment-item', { reply: c.parentId }]">
          <span class="user">{{ c.userNickname }}</span>
          <span v-if="c.parentId" class="reply-tag">回复</span>：
          <span>{{ c.content }}</span>
          <span class="time">{{ new Date(c.createdAt).toLocaleString() }}</span>
        </div>
        <div v-if="!comments.length" class="no-comments">暂无留言</div>

        <template v-if="userStore.isLoggedIn">
          <el-input
            v-model="newComment"
            placeholder="输入留言，按回车发送"
            @keyup.enter="postComment"
            clearable
            style="margin-top: 10px"
          />
          <el-button v-if="canReply" size="small" style="margin-top: 8px" @click="replyToBuyer">
            回复买家
          </el-button>
        </template>
        <p v-else class="login-tip">登录后可留言咨询</p>
      </div>
    </main>

    <div v-else class="loading-box">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 图片全屏预览 -->
    <Teleport to="body">
      <div
        v-if="previewVisible"
        class="image-preview-overlay"
        @click="closePreview"
      >
        <div class="preview-close" @click="closePreview">✕</div>
        <img
          :src="product?.images?.[previewIndex] || ''"
          :alt="product?.title"
          class="preview-image"
          @click.stop
        />
        <button
          v-if="product?.images?.length > 1"
          class="preview-arrow preview-arrow-left"
          @click.stop="previewPrev"
        >‹</button>
        <button
          v-if="product?.images?.length > 1"
          class="preview-arrow preview-arrow-right"
          @click.stop="previewNext"
        >›</button>
        <div v-if="product?.images?.length > 1" class="preview-counter">
          {{ previewIndex + 1 }} / {{ product.images.length }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, UserFilled, Loading } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/userStore';
import { getProductDetail } from '@/api/product';
import { getComments, addComment } from '@/api/comments';
import { createOrder } from '@/api/orders';
import request from '@/utils/request';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const product = ref(null);
const currentImageIndex = ref(0);
const previewVisible = ref(false);
const previewIndex = ref(0);

function openPreview() {
  previewIndex.value = currentImageIndex.value;
  previewVisible.value = true;
}
function closePreview() {
  previewVisible.value = false;
}
function previewPrev() {
  if (!product.value?.images) return;
  previewIndex.value =
    (previewIndex.value - 1 + product.value.images.length) %
    product.value.images.length;
}
function previewNext() {
  if (!product.value?.images) return;
  previewIndex.value =
    (previewIndex.value + 1) % product.value.images.length;
}

const comments = ref([]);
const newComment = ref('');
const ordering = ref(false);
const replyParentId = ref(null);

function prevImage() {
  if (!product.value?.images) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length;
}
function nextImage() {
  if (!product.value?.images) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
}

const canEdit = computed(() => {
  if (!userStore.isLoggedIn || !product.value) return false;
  return userStore.user?.id === product.value.sellerId;
});

const canReply = computed(() => {
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

async function handleWant() {
  if (!userStore.isLoggedIn) {
    userStore.openLogin();
    return;
  }
  ordering.value = true;
  try {
    const { data } = await createOrder(product.value.id);
    ElMessage.success('订单已创建，请前往付款');
    router.push(`/orders/${data.order.id}`);
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '下单失败');
  } finally {
    ordering.value = false;
  }
}

async function handleReport() {
  if (!userStore.isLoggedIn) {
    userStore.openLogin();
    return;
  }
  try {
    const { value } = await ElMessageBox.prompt('请描述举报原因', '举报商品', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
    });
    if (!value?.trim()) return;
    await request.post('/reports', {
      targetType: 'product',
      targetId: product.value.id,
      reason: value.trim(),
    });
    ElMessage.success('举报已提交');
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.response?.data?.message || '举报失败');
    }
  }
}

function replyToBuyer() {
  const lastBuyerComment = [...comments.value]
    .reverse()
    .find((c) => c.userId !== product.value.sellerId);
  replyParentId.value = lastBuyerComment ? lastBuyerComment.id : null;
  if (!newComment.value) {
    newComment.value = '';
  }
  ElMessage.info('请在输入框中填写回复内容后回车发送');
}

async function fetchComments() {
  try {
    const { data } = await getComments(route.params.id, { page: 1, limit: 50 });
    comments.value = data.comments;
  } catch (e) {
    ElMessage.error('加载留言失败');
  }
}

async function postComment() {
  if (!userStore.isLoggedIn) {
    userStore.openLogin();
    return;
  }
  if (!newComment.value.trim()) return;
  try {
    await addComment(route.params.id, newComment.value.trim(), replyParentId.value);
    newComment.value = '';
    replyParentId.value = null;
    fetchComments();
  } catch (e) {
    ElMessage.error('发送留言失败');
  }
}

onMounted(() => {
  fetchDetail();
  fetchComments();
});
</script>

<style scoped>
.detail-page {
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
  justify-content: space-between;
  align-items: center;
}
.seller-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.main-content {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 24px;
}

.detail-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
}

.image-section {
  width: 400px;
  min-height: 300px;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}
.image-main {
  position: relative;
  width: 100%;
  height: 300px;
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  border: none;
  width: 32px;
  height: 48px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 2;
}
.img-arrow:hover {
  background: rgba(0, 0, 0, 0.55);
}
.img-arrow-left {
  left: 0;
  border-radius: 0 6px 6px 0;
}
.img-arrow-right {
  right: 0;
  border-radius: 6px 0 0 6px;
}

.image-thumbs {
  display: flex;
  gap: 6px;
  padding: 8px;
  overflow-x: auto;
}
.thumb-item {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.thumb-item.active {
  border-color: var(--primary-color);
}
.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.info-section {
  flex: 1;
  min-width: 300px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.product-title {
  font-size: 22px;
  color: var(--text-primary);
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}
.price {
  font-size: 28px;
  color: var(--danger-color);
  font-weight: 700;
}
.original-price {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: line-through;
}
.condition {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 500;
}

.seller-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}
.seller-name {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}
.seller-school {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.action-row {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.contact-row {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.desc-section {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
.desc-section h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.desc-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.8;
  white-space: pre-wrap;
}
.publish-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 12px;
}

.loading-box {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
}

.comments-section {
  margin-top: 30px;
  padding: 20px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  line-height: 1.6;
}
.comment-item .user {
  font-weight: 500;
  color: var(--text-primary);
}
.comment-item .time {
  float: right;
  color: var(--text-secondary);
  font-size: 12px;
}
.comment-item.reply {
  margin-left: 24px;
  border-left: 3px solid var(--primary-color);
  padding-left: 8px;
}
.reply-tag {
  font-size: 12px;
  color: var(--primary-color);
  margin-left: 4px;
}
.login-tip {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
}
.no-comments {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
<style>
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}
.preview-close {
  position: absolute;
  top: 20px;
  right: 24px;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  z-index: 10;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
}
.preview-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
  border-radius: 4px;
}
.preview-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.preview-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
}
.preview-arrow-left {
  left: 20px;
}
.preview-arrow-right {
  right: 20px;
}
.preview-counter {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 16px;
  border-radius: 20px;
}
</style>
