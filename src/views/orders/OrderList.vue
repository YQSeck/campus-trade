<!-- 【模块三：交易与订单】订单列表 -->
<!-- AI 生成：手动调整前请勿修改 -->
<template>
  <div class="order-list-page">
    <el-button link class="back-btn" @click="$router.push('/')">
      <el-icon><ArrowLeft /></el-icon>返回首页
    </el-button>
    <h2>我的订单</h2>
    <el-tabs v-model="activeRole" @tab-click="fetchOrders">
      <el-tab-pane label="我是买家" name="buyer" />
      <el-tab-pane label="我是卖家" name="seller" />
    </el-tabs>
    <el-table :data="orders" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="订单号" width="80" />
      <el-table-column prop="productTitle" label="商品" />
      <el-table-column prop="price" label="金额" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{
            statusText(row.status)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180">
        <template #default="{ row }">{{
          new Date(row.createdAt).toLocaleString()
        }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleDetail(row)">详情</el-button>
          <el-button
            v-if="activeRole === 'buyer' && row.status === 'pending'"
            type="primary"
            size="small"
            @click="handlePay(row)"
            >付款</el-button
          >
          <el-button
            v-if="activeRole === 'seller' && row.status === 'paid'"
            type="success"
            size="small"
            @click="handleShip(row)"
            >发货</el-button
          >
          <el-button
            v-if="activeRole === 'buyer' && row.status === 'shipped'"
            type="success"
            size="small"
            @click="handleReceive(row)"
            >确认收货</el-button
          >
          <el-button
            v-if="['pending', 'paid'].includes(row.status)"
            type="danger"
            size="small"
            @click="handleCancel(row)"
            >取消</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @change="fetchOrders"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getOrderList, updateOrderStatus, payOrder } from "@/api/orders";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const activeRole = ref("buyer");
const orders = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const statusMap = {
  pending: "待付款",
  paid: "待发货",
  shipped: "待收货",
  received: "已完成",
  completed: "已完成",
  cancelled: "已取消",
};
const statusTagType = {
  pending: "warning",
  paid: "info",
  shipped: "",
  received: "success",
  completed: "success",
  cancelled: "danger",
};

function statusText(status) {
  return statusMap[status] || status;
}
function statusTag(status) {
  return statusTagType[status] || "";
}

async function fetchOrders() {
  loading.value = true;
  try {
    const { data } = await getOrderList({
      role: activeRole.value,
      page: currentPage.value,
      limit: pageSize.value,
    });
    orders.value = data.orders;
    total.value = data.total;
  } catch (e) {
    ElMessage.error("加载订单失败");
  } finally {
    loading.value = false;
  }
}

function handleDetail(order) {
  router.push(`/orders/${order.id}`);
}

async function handlePay(order) {
  try {
    await ElMessageBox.confirm(`确认支付 ¥${order.price}？`, "模拟支付");
    await payOrder(order.id);
    ElMessage.success("支付成功");
    fetchOrders();
  } catch (e) {
    if (e !== "cancel") ElMessage.error("支付失败");
  }
}

async function handleShip(order) {
  try {
    await updateOrderStatus(order.id, "shipped");
    ElMessage.success("已标记发货");
    fetchOrders();
  } catch (e) {
    ElMessage.error("操作失败");
  }
}

async function handleReceive(order) {
  try {
    await updateOrderStatus(order.id, "received");
    ElMessage.success("已确认收货，交易完成");
    fetchOrders();
  } catch (e) {
    ElMessage.error("操作失败");
  }
}

async function handleCancel(order) {
  try {
    await ElMessageBox.confirm("确定取消订单？", "提示");
    await updateOrderStatus(order.id, "cancelled");
    ElMessage.success("订单已取消");
    fetchOrders();
  } catch (e) {
    if (e !== "cancel") ElMessage.error("取消失败");
  }
}

onMounted(fetchOrders);
</script>

<style scoped>
.order-list-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
</style>
