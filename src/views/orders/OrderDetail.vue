<template>
  <div class="order-detail-page">
    <template v-if="loading">
      <el-skeleton :rows="6" animated />
    </template>

    <template v-else-if="order">
      <el-steps :active="activeStep" align-center class="order-steps">
        <el-step title="下单" />
        <el-step title="付款" />
        <el-step title="发货" />
        <el-step title="收货" />
        <el-step title="完成" />
      </el-steps>

      <el-card class="info-card">
        <div class="product-section">
          <img :src="order.product?.images?.[0] || defaultImg" class="product-img" />
          <div>
            <h3>{{ order.product?.title || '商品已删除' }}</h3>
            <div class="price">¥{{ order.price }}</div>
            <div class="meta">
              <el-tag :type="statusTag(order.status)">{{ statusText(order.status) }}</el-tag>
              <span class="divider">|</span>
              <span>卖家：{{ order.seller?.nickname || '未知' }}</span>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border class="desc-table">
          <el-descriptions-item label="订单编号">{{ order._id }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ dayjs(order.createdAt).format('YYYY-MM-DD HH:mm') }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ order.buyer?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="卖家">{{ order.seller?.nickname }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <div class="action-bar">
        <template v-if="isBuyer">
          <el-button
            v-if="order.status === 'pending_payment'"
            type="success" size="large" @click="pay"
          >
            <el-icon><CreditCard /></el-icon> 模拟付款
          </el-button>
          <el-button
            v-if="order.status === 'pending_receipt'"
            type="primary" size="large" @click="confirm"
          >
            <el-icon><CircleCheck /></el-icon> 确认收货
          </el-button>
          <el-button
            v-if="order.status === 'pending_payment'"
            type="danger" size="large" plain @click="cancel"
          >
            取消订单
          </el-button>
          <el-button
            v-if="order.status === 'completed' && !order.isReviewed"
            type="warning" size="large" @click="reviewVisible = true"
          >
            <el-icon><Star /></el-icon> 评价卖家
          </el-button>
        </template>
        <template v-if="isSeller">
          <el-button
            v-if="order.status === 'pending_shipment'"
            type="primary" size="large" @click="ship"
          >
            <el-icon><Van /></el-icon> 确认发货
          </el-button>
        </template>
      </div>

      <el-dialog v-model="reviewVisible" title="给卖家写评价" width="480px">
        <div class="review-dialog">
          <div class="rate-row">
            <span>综合评分：</span>
            <el-rate v-model="rating" show-score text-color="#ff9900" />
          </div>
          <el-input
            v-model="reviewComment"
            type="textarea"
            :rows="4"
            placeholder="分享你的交易体验吧~"
            maxlength="300"
            show-word-limit
          />
        </div>
        <template #footer>
          <el-button @click="reviewVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting">提交评价</el-button>
        </template>
      </el-dialog>
    </template>

    <el-empty v-else description="订单不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  getOrderDetail, payOrder, shipOrder, confirmOrder, cancelOrder, submitReview
} from '@/api/order';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';
import defaultImg from '@/assets/default.jpg';

const route = useRoute();
const userStore = useUserStore();
const order = ref(null);
const loading = ref(true);
const reviewVisible = ref(false);
const rating = ref(5);
const reviewComment = ref('');
const submitting = ref(false);

const isBuyer = computed(() => order.value?.buyer?._id === userStore.user._id);
const isSeller = computed(() => order.value?.seller?._id === userStore.user._id);

const activeStep = computed(() => {
  const map = {
    pending_payment: 1,
    pending_shipment: 2,
    pending_receipt: 3,
    completed: 4,
    cancelled: -1
  };
  return map[order.value?.status] ?? 0;
});

const fetchOrder = async () => {
  loading.value = true;
  try {
    const res = await getOrderDetail(route.params.id);
    order.value = res.data;
  } finally {
    loading.value = false;
  }
};

const pay = async () => {
  await payOrder(order.value._id);
  ElMessage.success('付款成功');
  fetchOrder();
};
const ship = async () => {
  await shipOrder(order.value._id);
  ElMessage.success('已通知买家发货');
  fetchOrder();
};
const confirm = async () => {
  await confirmOrder(order.value._id);
  ElMessage.success('已确认收货，交易完成！');
  fetchOrder();
};
const cancel = async () => {
  await cancelOrder(order.value._id);
  ElMessage.info('订单已取消');
  fetchOrder();
};
const submitReviewHandler = async () => {
  submitting.value = true;
  try {
    await submitReview(order.value._id, {
      rating: rating.value,
      comment: reviewComment.value
    });
    ElMessage.success('评价成功');
    reviewVisible.value = false;
    fetchOrder();
  } finally {
    submitting.value = false;
  }
};

const statusText = (s) => ({
  pending_payment: '待付款',
  pending_shipment: '待发货',
  pending_receipt: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}[s]);
const statusTag = (s) => ({
  pending_payment: 'warning',
  pending_shipment: 'primary',
  pending_receipt: '',
  completed: 'success',
  cancelled: 'info'
}[s]);

onMounted(fetchOrder);
</script>

<style scoped>
.order-detail-page {
  max-width: 800px;
  margin: 24px auto;
  padding: 0 16px;
}
.order-steps {
  margin-bottom: 24px;
}
.info-card {
  margin-bottom: 20px;
}
.product-section {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}
.product-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}
.price {
  font-size: 20px;
  color: #e74c3c;
  font-weight: bold;
  margin: 8px 0;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.divider {
  color: #ccc;
}
.action-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}
.review-dialog .rate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
</style>
