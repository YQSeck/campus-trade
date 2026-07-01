<template>
  <div class="admin-panel" v-if="isAdmin">
    <el-button link class="back-btn" @click="$router.push('/')">
      <el-icon><ArrowLeft /></el-icon>返回首页
    </el-button>
    <h2>管理员控制台</h2>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header>近7天交易额</template>
      <div ref="chartRef" style="width: 100%; height: 300px"></div>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>商品审核</span>
      </template>
      <el-table :data="productList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="商品名称" />
        <el-table-column prop="sellerNickname" label="卖家" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="toggleProductStatus(row)"
              :type="row.status === 'active' ? 'warning' : 'success'"
            >
              {{ row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="productTotal > 10"
        layout="prev, pager, next"
        :total="productTotal"
        :page-size="10"
        @current-change="fetchProducts"
      />
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>用户管理</span>
      </template>
      <el-table :data="userList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="role" label="角色" width="80" />
        <el-table-column prop="lockedUntil" label="封禁状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.lockedUntil ? 'danger' : 'success'">
              {{ row.lockedUntil ? '封禁中' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="banUser(row)" :disabled="row.role === 'admin'"
              >封禁</el-button
            >
            <el-button size="small" @click="unbanUser(row)" :disabled="!row.lockedUntil"
              >解封</el-button
            >
            <el-button size="small" @click="resetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="userTotal > 10"
        layout="prev, pager, next"
        :total="userTotal"
        :page-size="10"
        @current-change="fetchUsers"
      />
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>举报处理</span>
      </template>
      <el-table :data="reportList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="reason" label="举报原因" />
        <el-table-column prop="targetType" label="对象类型" width="80" />
        <el-table-column prop="targetId" label="对象ID" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 'pending'
                  ? 'warning'
                  : row.status === 'resolved'
                    ? 'success'
                    : 'info'
              "
            >
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
          v-if="reportList.some((r) => r.status === 'pending')"
        >
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" @click="resolveReport(row)">已处理</el-button>
              <el-button size="small" type="danger" @click="dismissReport(row)">驳回</el-button>
            </template>
            <span v-else>已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>评价管理</span>
      </template>
      <el-table :data="reviewList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="reviewerNickname" label="评价人" width="100" />
        <el-table-column prop="orderTitle" label="关联订单" />
        <el-table-column prop="rating" label="星级" width="80">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" />
        <el-table-column prop="createdAt" label="时间" width="170" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteReview(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <div v-else class="unauthorized">
    <el-result icon="warning" title="无权限访问" sub-title="请使用管理员账号登录" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { useUserStore } from '@/store/userStore';
import { ElMessage } from 'element-plus';
import {
  getAdminStats,
  getAdminProducts,
  updateProduct,
  deleteProduct as deleteProductApi,
  getAdminUsers,
  banUserApi,
  unbanUserApi,
  resetPasswordApi,
  getReports,
  resolveReportApi,
  dismissReportApi,
  getAdminReviews,
  deleteReviewApi,
} from '@/api/admin';

const userStore = useUserStore();
const isAdmin = userStore.isAdmin;

const stats = ref([
  { label: '商品总数', value: 0 },
  { label: '订单总数', value: 0 },
  { label: '用户总数', value: 0 },
  { label: '本周交易额(¥)', value: 0 },
]);

const chartRef = ref(null);
let chartInstance = null;

const productList = ref([]);
const productTotal = ref(0);
const userList = ref([]);
const userTotal = ref(0);
const reportList = ref([]);
const reportTotal = ref(0);

const statusMap = {
  pending: '待处理',
  resolved: '已处理',
  dismissed: '已驳回',
};

const fetchStats = async () => {
  try {
    const { data } = await getAdminStats();
    stats.value[0].value = data.productCount;
    stats.value[1].value = data.orderCount;
    stats.value[2].value = data.userCount;
    stats.value[3].value = data.weeklyVolume;
    renderChart(data.dailyVolume);
  } catch (e) {
    console.error('获取统计失败', e);
  }
};

const renderChart = (dailyVolume) => {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dailyVolume.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [{ data: dailyVolume.map((d) => d.volume), type: 'line', smooth: true }],
  });
};

const fetchProducts = async (page = 1) => {
  const { data } = await getAdminProducts(page);
  productList.value = data.products;
  productTotal.value = data.total;
};

const toggleProductStatus = async (row) => {
  const newStatus = row.status === 'active' ? 'removed' : 'active';
  try {
    await updateProduct(row.id, { status: newStatus });
    row.status = newStatus;
    ElMessage.success('操作成功');
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const deleteProduct = async (id) => {
  try {
    await deleteProductApi(id);
    ElMessage.success('商品已删除');
    fetchProducts();
  } catch (e) {
    ElMessage.error('删除失败');
  }
};

const fetchUsers = async (page = 1) => {
  const { data } = await getAdminUsers(page);
  userList.value = data.users;
  userTotal.value = data.total;
};
const banUser = async (user) => {
  await banUserApi(user.id);
  user.lockedUntil = '已封禁';
};
const unbanUser = async (user) => {
  await unbanUserApi(user.id);
  user.lockedUntil = null;
};
const resetPassword = async (user) => {
  await resetPasswordApi(user.id);
  ElMessage.success('密码已重置为默认');
};

const fetchReports = async (page = 1) => {
  const { data } = await getReports(page);
  reportList.value = data.reports;
  reportTotal.value = data.total;
};
const resolveReport = async (row) => {
  await resolveReportApi(row.id);
  row.status = 'resolved';
};
const dismissReport = async (row) => {
  await dismissReportApi(row.id);
  row.status = 'dismissed';
};

const reviewList = ref([]);
const fetchReviews = async () => {
  const { data } = await getAdminReviews();
  reviewList.value = data.reviews;
};
const deleteReview = async (row) => {
  await deleteReviewApi(row.id);
  fetchReviews();
};

const handleResize = () => chartInstance?.resize();

onMounted(() => {
  if (isAdmin) {
    fetchStats();
    fetchProducts();
    fetchUsers();
    fetchReports();
    fetchReviews();
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) chartInstance.dispose();
});
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 8px;
  color: var(--primary-color);
}
.chart-card {
  margin-bottom: 20px;
}
.table-card {
  margin-bottom: 20px;
}
</style>
