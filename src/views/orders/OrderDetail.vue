<template>
  <div class="order-detail" v-loading="loading">
    <h2>订单详情</h2>
    <el-descriptions v-if="order" :column="2" border>
      <el-descriptions-item label="订单号">{{ order.id }}</el-descriptions-item>
      <el-descriptions-item label="商品">{{ order.productTitle }}</el-descriptions-item>
      <el-descriptions-item label="金额">¥{{ order.price }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag>{{ statusMap[order.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="下单时间">{{ new Date(order.createdAt).toLocaleString() }}</el-descriptions-item>
    </el-descriptions>

    <div v-if="showReviewForm" style="margin-top:20px">
      <h3>评价卖家</h3>
      <el-rate v-model="reviewRating" show-score />
      <el-input v-model="reviewContent" type="textarea" placeholder="写点什么吧" rows="3" style="margin-top:10px" />
      <el-button type="primary" @click="submitReview" :loading="submitting" style="margin-top:10px">提交评价</el-button>
    </div>

    <div v-if="alreadyReviewed" style="margin-top:20px">
      <el-alert title="您已评价该订单" type="success" :closable="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getOrderDetail } from '@/api/orders';
import { createReview } from '@/api/reviews';
import { ElMessage } from 'element-plus';

const route = useRoute();
const order = ref(null);
const loading = ref(false);
const reviewRating = ref(5);
const reviewContent = ref('');
const submitting = ref(false);

// 模拟当前用户角色（实际应从 store 获取）
const currentUserId = 3; // 假设当前为买家李四

const statusMap = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  received: '已完成',
  cancelled: '已取消'
};

const showReviewForm = computed(() => {
  return order.value &&
         order.value.status === 'received' &&
         order.value.buyerId === currentUserId &&
         !alreadyReviewed.value;
});

const alreadyReviewed = ref(false);

async function fetchOrder() {
  loading.value = true;
  try {
    const { data } = await getOrderDetail(route.params.id);
    order.value = data.order;
  } catch (e) {
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
}

async function submitReview() {
  if (!reviewRating.value) return;
  submitting.value = true;
  try {
    await createReview(order.value.id, {
      rating: reviewRating.value,
      content: reviewContent.value
    });
    ElMessage.success('评价成功');
    alreadyReviewed.value = true;
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '评价失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(fetchOrder);
</script>

<style scoped>
.order-detail {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
}
</style>
