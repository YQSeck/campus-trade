<template>
  <div class="admin-panel" v-if="isAdmin">
    <el-button link class="back-btn" @click="$router.push('/')">
      <el-icon><ArrowLeft /></el-icon>返回首页
    </el-button>
    <h2>管理员控制台</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交易额趋势图 -->
    <el-card class="chart-card">
      <template #header>近7天交易额</template>
      <div ref="chartRef" style="width: 100%; height: 300px"></div>
    </el-card>

    <!-- 商品审核 -->
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
              {{ row.status === "active" ? "在售" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="handleViewProduct(row)">
              详情
            </el-button>
            <el-button
              size="small"
              @click="toggleProductStatus(row)"
              :type="row.status === 'active' ? 'warning' : 'success'"
            >
              {{ row.status === "active" ? "下架" : "上架" }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row.id)"
              >删除</el-button
            >
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

    <!-- 用户管理 -->
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
              {{ row.lockedUntil ? "封禁中" : "正常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="banUser(row)"
              :disabled="row.role === 'admin'"
              >封禁</el-button
            >
            <el-button
              size="small"
              @click="unbanUser(row)"
              :disabled="!row.lockedUntil"
              >解封</el-button
            >
            <el-button size="small" @click="resetPassword(row)"
              >重置密码</el-button
            >
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

    <!-- 举报处理 -->
    <el-card class="table-card">
      <template #header>
        <span>举报处理</span>
      </template>
      <el-table :data="reportList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="reason" label="举报原因" />
        <el-table-column prop="targetType" label="对象类型" width="90" />
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
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <!-- 详情按钮（所有类型都有） -->
            <el-button size="small" type="info" @click="handleViewReport(row)">
              详情
            </el-button>

            <!-- 商品举报：删除商品按钮 -->
            <template
              v-if="row.targetType === 'product' && row.status === 'pending'"
            >
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteProductByReport(row)"
              >
                删除商品
              </el-button>
            </template>

            <!-- 留言举报：删除留言按钮 -->
            <template
              v-if="row.targetType === 'comment' && row.status === 'pending'"
            >
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteComment(row)"
              >
                删除留言
              </el-button>
            </template>

            <!-- 驳回按钮（所有待处理举报都有） -->
            <template v-if="row.status === 'pending'">
              <el-button
                size="small"
                type="warning"
                @click="dismissReport(row)"
              >
                驳回
              </el-button>
            </template>

            <!-- 已处理的显示状态 -->
            <span v-else style="color: var(--text-secondary)"> 已处理 </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 评价管理 -->
    <el-card class="table-card">
      <template #header>
        <span>评价管理</span>
      </template>
      <el-table :data="reviewList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="reviewerNickname" label="评价人" width="100" />
        <el-table-column prop="orderTitle" label="关联订单" />
        <el-table-column prop="rating" label="星级" width="140">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" />
        <el-table-column prop="createdAt" label="时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString("zh-CN") }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteReview(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <div v-else class="unauthorized">
    <el-result
      icon="warning"
      title="无权限访问"
      sub-title="请使用管理员账号登录"
    />
  </div>
  <!-- ===== 通用详情弹窗（新增） ===== -->
  <el-dialog
    v-model="detailDialogVisible"
    :title="detailDialogTitle"
    width="600px"
    destroy-on-close
  >
    <div v-loading="detailLoading" style="min-height: 120px">
      <!-- 商品详情 -->
      <template v-if="detailType === 'product' && detailData">
        <div class="detail-image-wrap" v-if="detailData.images?.length">
          <el-image
            v-for="(img, idx) in detailData.images"
            :key="idx"
            :src="img"
            fit="cover"
            style="
              width: 100px;
              height: 100px;
              margin-right: 8px;
              border-radius: 4px;
            "
            :preview-src-list="detailData.images"
          />
        </div>
        <el-descriptions :column="2" border style="margin-top: 12px">
          <el-descriptions-item label="标题">{{
            detailData.title
          }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{
            detailData.category
          }}</el-descriptions-item>
          <el-descriptions-item label="售价"
            >¥{{ detailData.price }}</el-descriptions-item
          >
          <el-descriptions-item label="原价" v-if="detailData.originalPrice"
            >¥{{ detailData.originalPrice }}</el-descriptions-item
          >
          <el-descriptions-item label="成色"
            >{{ detailData.condition }}成新</el-descriptions-item
          >
          <el-descriptions-item label="卖家">{{
            detailData.sellerNickname
          }}</el-descriptions-item>
          <el-descriptions-item label="学校">{{
            detailData.sellerSchool
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 'active' ? 'success' : 'info'">
              {{ detailData.status === "active" ? "在售" : "已下架" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ detailData.description }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 举报详情 -->
      <template v-if="detailType === 'report' && detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="举报ID">{{
            detailData.id
          }}</el-descriptions-item>
          <el-descriptions-item label="举报人">{{
            detailData.reporterNickname || "未知"
          }}</el-descriptions-item>
          <el-descriptions-item label="目标类型">{{
            detailData.targetType
          }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{
            detailData.targetId
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="
                detailData.status === 'pending'
                  ? 'warning'
                  : detailData.status === 'resolved'
                    ? 'success'
                    : 'info'
              "
            >
              {{
                detailData.status === "pending"
                  ? "待处理"
                  : detailData.status === "resolved"
                    ? "已处理"
                    : "已驳回"
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报时间">
            {{ new Date(detailData.createdAt).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="举报原因" :span="2">
            {{ detailData.reason }}
          </el-descriptions-item>
          <el-descriptions-item
            label="目标详情"
            :span="2"
            v-if="detailData.targetDetail"
          >
            <div v-if="detailData.targetType === 'product'">
              <strong>{{ detailData.targetDetail.title }}</strong>
              <span style="margin-left: 12px; color: var(--text-secondary)">
                售价 ¥{{ detailData.targetDetail.price }}
              </span>
              <span style="margin-left: 12px; color: var(--text-secondary)">
                {{
                  detailData.targetDetail.status === "active"
                    ? "在售"
                    : "已下架"
                }}
              </span>
            </div>
            <div v-else-if="detailData.targetType === 'comment'">
              {{ detailData.targetDetail.content || "留言内容" }}
            </div>
            <span v-else>无额外详情</span>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </div>
    <template #footer>
      <el-button @click="detailDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";
import {
  getAdminStats,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getAdminUsers,
  banUserApi,
  unbanUserApi,
  resetPasswordApi,
  getReports,
  getReportDetail,
  resolveReportApi,
  dismissReportApi,
  getAdminReviews,
  deleteReviewApi,
  deleteCommentApi,
} from "@/api/admin";
import * as echarts from "echarts";

// 权限判断：从 localStorage 获取用户信息
const user = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = user.role === "admin";

// 统计数据
const stats = ref([
  { label: "商品总数", value: 0 },
  { label: "订单总数", value: 0 },
  { label: "用户总数", value: 0 },
  { label: "本周交易额(¥)", value: 0 },
]);

// 图表
const chartRef = ref(null);
let chartInstance = null;

// 列表数据
const productList = ref([]);
const productTotal = ref(0);
const userList = ref([]);
const userTotal = ref(0);
const reportList = ref([]);
const reportTotal = ref(0);

const statusMap = {
  pending: "待处理",
  resolved: "已处理",
  dismissed: "已驳回",
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const { data } = await getAdminStats();
    stats.value[0].value = data.productCount;
    stats.value[1].value = data.orderCount;
    stats.value[2].value = data.userCount;
    stats.value[3].value = data.weeklyVolume;
    renderChart(data.dailyVolume);
  } catch (e) {
    console.error("获取统计失败", e);
  }
};

// 渲染图表
const renderChart = (dailyVolume) => {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption({
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dailyVolume.map((d) => d.date) },
    yAxis: { type: "value" },
    series: [
      { data: dailyVolume.map((d) => d.volume), type: "line", smooth: true },
    ],
  });
};

// 获取商品列表
const fetchProducts = async (page = 1) => {
  const { data } = await getAdminProducts(page);
  productList.value = data.products;
  productTotal.value = data.total;
};

// 商品状态切换
const toggleProductStatus = async (row) => {
  const newStatus = row.status === "active" ? "removed" : "active";
  try {
    await updateProduct(row.id, { status: newStatus });
    row.status = newStatus;
  } catch (e) {
    console.error("操作失败", e);
  }
};

// 删除商品
const deleteProductById = async (id) => {
  await deleteProduct(id);
  fetchProducts(); // 刷新
};

// 用户管理
const fetchUsers = async (page = 1) => {
  const { data } = await getAdminUsers(page);
  userList.value = data.users;
  userTotal.value = data.total;
};
const banUser = async (user) => {
  await banUserApi(user.id);
  user.lockedUntil = "已封禁"; // 模拟
};
const unbanUser = async (user) => {
  await unbanUserApi(user.id);
  user.lockedUntil = null;
};
const resetPassword = async (user) => {
  await resetPasswordApi(user.id);
  alert("密码已重置为默认");
};

// 举报处理
const fetchReports = async (page = 1) => {
  const { data } = await getReports(page);
  reportList.value = data.reports;
  reportTotal.value = data.total;
};
const resolveReport = async (row) => {
  await resolveReportApi(row.id);
  row.status = "resolved";
};
const dismissReport = async (row) => {
  await dismissReportApi(row.id);
  row.status = "dismissed";
};

// 评价管理
const reviewList = ref([]);
const fetchReviews = async () => {
  const { data } = await getAdminReviews();
  reviewList.value = data.reviews;
};
const deleteReview = async (row) => {
  await deleteReviewApi(row.id);
  fetchReviews();
};

// ===== 删除留言（新增） =====
const handleDeleteComment = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除该留言？被举报留言：${row.targetDetail?.content || "内容已加载"}。删除后不可恢复。`,
      "删除留言",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      },
    );
  } catch {
    return;
  }
  try {
    await deleteCommentApi(row.targetId);
    ElMessage.success("留言已删除");
    // 同时将举报状态设为已处理
    await resolveReportApi(row.id);
    row.status = "resolved";
    // 刷新举报列表
    fetchReports();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || "删除失败");
  }
};

// ===== 管理员通过举报删除商品（新增） =====
const handleDeleteProductByReport = async (row) => {
  // 获取商品名称（用于确认弹窗显示）
  let productTitle = "该商品";
  try {
    const { getProductDetail } = await import("@/api/product");
    const res = await getProductDetail(row.targetId);
    productTitle = res.data.product?.title || "该商品";
  } catch {
    // 如果获取失败，使用默认名称
  }

  try {
    await ElMessageBox.confirm(
      `确认删除被举报的商品「${productTitle}」？删除后不可恢复，举报将自动标记为已处理。`,
      "删除商品",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      },
    );
  } catch {
    return;
  }

  try {
    // 1. 删除商品（复用已有的 deleteProduct API）
    await deleteProduct(row.targetId);
    // 2. 将举报状态设为已处理
    await resolveReportApi(row.id);
    // 3. 更新当前行状态
    row.status = "resolved";
    ElMessage.success("商品已删除，举报已处理");
    // 4. 刷新举报列表
    fetchReports();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || "操作失败");
  }
};

// ===== 详情弹窗（新增） =====
const detailDialogVisible = ref(false);
const detailDialogTitle = ref("");
const detailLoading = ref(false);
const detailData = ref(null);
const detailType = ref("product"); // 'product' | 'report'

// 查看商品详情
const handleViewProduct = async (row) => {
  detailType.value = "product";
  detailDialogTitle.value = `商品详情 - ${row.title}`;
  detailDialogVisible.value = true;
  detailLoading.value = true;
  try {
    const { getProductDetail } = await import("@/api/product");
    const res = await getProductDetail(row.id);
    detailData.value = res.data.product;
  } catch (e) {
    ElMessage.error("加载商品详情失败");
    detailData.value = row;
  } finally {
    detailLoading.value = false;
  }
};

// 查看举报详情
const handleViewReport = async (row) => {
  detailType.value = "report";
  detailDialogTitle.value = `举报详情 #${row.id}`;
  detailDialogVisible.value = true;
  detailLoading.value = true;
  try {
    const res = await getReportDetail(row.id);
    detailData.value = res.data.report;
  } catch (e) {
    ElMessage.error("加载举报详情失败");
    detailData.value = row;
  } finally {
    detailLoading.value = false;
  }
};

onMounted(() => {
  if (isAdmin) {
    fetchStats();
    fetchProducts();
    fetchUsers();
    fetchReports();
    fetchReviews();
  }
});

// 响应式图表大小
window.addEventListener("resize", () => chartInstance?.resize());
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
