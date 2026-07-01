<template>
  <div class="order-page">
    <div class="tab-header">
      <el-radio-group v-model="activeTab" size="large" @change="fetchOrders">
        <el-radio-button label="buyer">我买的</el-radio-button>
        <el-radio-button label="seller">我卖的</el-radio-button>
      </el-radio-group>
    </div>

    <el-empty v-if="orders.length === 0 && !loading" description="暂无订单" />

    <div v-else class="order-grid">
      <el-card
        v-for="order in orders"
        :key="order._id"
        class="order-card"
        shadow="hover"
        @click="router.push(`/orders/${order._id}`)"
      >
        <div class="card-header">
          <img :src="order.product?.images?.[0] || defaultImg" class="product-thumb" />
          <div class="product-info">
            <h4 class="title">{{ order.product?.title || '商品已删除' }}</h4>
            <span class="price">¥{{ order.price }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-tag :type="statusTag(order.status)" effect="plain">
            {{ statusText(order.status) }}
          </el-tag>
          <div class="actions" @click.stop>
            <el-button
              v-if="order.status === 'pending_payment' && activeTab === 'buyer'"
              type="success" size="small" round
              @click="handlePay(order._id)"
            >
              付款
            </el-button>
            <el-button
              v-if="order.status === 'pending_payment' && activeTab === 'buyer'"
              type="danger" size="small" round
              @click="handleCancel(order._id)"
            >
              取消
            </el-button>
          </div>
        </div>
        <div class="time">{{ dayjs(order.updatedAt).format('MM-DD HH:mm') }}</div>
      </el-card>
    </div>

    <div v-if="total > 10" class="pagination">
      <el-pagination layout="prev, pager, next" :total="total" @current-change="pageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getOrders, payOrder, cancelOrder } from '@/api/order';
import dayjs from 'dayjs';
import defaultImg from '@/assets/default.jpg'; // 默认商品图

const activeTab = ref('buyer');
const orders = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const router = useRouter();

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrders(activeTab.value, page.value);
    orders.value = res.data.orders;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const handlePay = async (id) => {
  await payOrder(id);
  ElMessage.success('付款成功');
  fetchOrders();
};

const handleCancel = async (id) => {
  await cancelOrder(id);
  ElMessage.success('订单已取消');
  fetchOrders();
};

const pageChange = (p) => {
  page.value = p;
  fetchOrders();
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

fetchOrders();
</script>

<style scoped>
.order-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.tab-header {
  text-align: center;
  margin-bottom: 24px;
}
.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.order-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.order-card:hover {
  transform: translateY(-4px);
}
.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
}
.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
.product-info .title {
  margin: 0 0 4px;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.price {
  color: #e74c3c;
  font-weight: bold;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.actions {
  display: flex;
  gap: 6px;
}
.time {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
  text-align: right;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
