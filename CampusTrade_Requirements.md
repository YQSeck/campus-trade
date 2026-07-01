# CampusTrade 校园二手交易平台 — 需求文档

---

## 一、项目概述

校园二手交易平台，支持用户注册登录、商品发布与管理、交易订单流转、评价信誉体系、后台管理、开放 API、CLI 工具及自动定价 Skill。

**技术栈**：Vue3 + Element Plus + Pinia + Axios + Vite / Node.js + Express / 纯 JavaScript / 内存数组存储

---

## 二、模块一：用户系统

### 2.1 注册/登录

| 功能 | 说明 |
|------|------|
| 注册方式 | 邮箱或手机号 |
| 登录凭证 | JWT Token，存储于 localStorage `token` 键 |
| 角色 | `user`（普通用户）、`admin`（管理员） |
| 忘记密码 | 模拟邮箱验证流程 |

### 2.2 个人信息管理

- 头像上传
- 昵称修改
- 学校信息
- 联系方式（可选是否公开显示）

### 2.3 安全功能

| 功能 | 说明 |
|------|------|
| 密码加密 | bcrypt，salt rounds = 10 |
| 登录失败限制 | 连续失败 5 次 → 冻结 30 分钟；连续失败 10 次 → 冻结 24 小时，需管理员解封 |
| 成功登录 | 重置失败计数器 |
| 冻结记录 | `lockedUntil` 字段记录解冻时间 |

### 2.4 用户对象

```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "张三",
  "school": "XX大学",
  "avatarUrl": "/uploads/avatar.jpg",
  "contact": "138xxxx",
  "role": "user",
  "reputationScore": 85,
  "lockedUntil": null
}
```

---

## 三、模块二：商品发布与管理

### 3.1 发布商品

表单字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 商品标题 |
| description | string | 商品描述 |
| category | string | 分类：书籍/电子产品/生活用品等 |
| price | number | 售价 |
| originalPrice | number | 原价 |
| condition | number | 成色 1-10 |
| images | string[] | 图片路径数组，最多 9 张 |

图片限制：单图最大 5MB，支持 jpg/png/webp，存储路径 `/uploads/products/{productId}/{timestamp}.jpg`

### 3.2 商品状态

| 状态 | 说明 | 可执行操作 |
|------|------|-----------|
| `active` | 在售 | 编辑、下架 |
| `removed` | 已下架 | 重新上架、删除 |
| `deleted` | 已删除 | 无（逻辑删除，数据保留） |

**普通用户**：只能操作自己的商品，可编辑 active 状态商品，可下架，可删除（逻辑删除，进入 deleted 状态）

**管理员**：可强制下架任何 active 商品，可删除（逻辑删除）任何商品，**不可发布商品**

### 3.3 普通用户发布列表

- 支持编辑、下架、删除
- 分页展示

### 3.4 商品搜索与筛选

```
GET /api/products?keyword=笔记本&category=电子产品&minPrice=100&maxPrice=2000&sort=price_asc&page=1&limit=10
```

| 参数 | 说明 |
|------|------|
| keyword | 关键词搜索，范围：标题（权重2）、描述（权重1） |
| category | 分类筛选 |
| minPrice / maxPrice | 价格区间 |
| sort | 排序：`price_asc` / `price_desc` / `newest` / `popular` |
| page / limit | 分页，默认 page=1, limit=10 |

响应格式：
```json
{
  "products": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### 3.5 商品对象

```json
{
  "id": 1,
  "title": "二手笔记本",
  "description": "九成新",
  "category": "电子产品",
  "price": 1500,
  "originalPrice": 4500,
  "condition": 9,
  "images": ["/uploads/img1.jpg"],
  "sellerId": 1,
  "sellerNickname": "张三",
  "sellerSchool": "XX大学",
  "status": "active",
  "createdAt": "2026-06-25T00:00:00.000Z"
}
```

---

## 四、模块三：交易与订单

### 4.1 留言功能

- **商品留言**：公开可见，任何人可查看，用于商品咨询
- **订单私信**：仅买卖双方可见，用于交易细节沟通

留言对象：
```json
{
  "id": 1,
  "productId": 1,
  "userId": 2,
  "userNickname": "李四",
  "content": "还在吗？",
  "createdAt": "2026-06-25T00:00:00.000Z"
}
```

### 4.2 下单流程

| 步骤 | 操作 | 状态变化 |
|------|------|---------|
| 1 | 买家点击"我想要" | 生成订单，状态 `pending`（待付款） |
| 2 | 买家取消订单 | 状态变为 `cancelled` |
| 3 | 买家付款 | 状态变为 `paid`（待确认收款） |
| 4 | 卖家确认收款 | 状态变为 `shipped`（待发货） |
| 5 | 卖家发货 | 状态保持 `shipped`（待收货） |
| 6 | 买家确认收货 | 状态变为 `received`（已完成） |
| 7 | 双方互评 | 评价完成后订单关闭 |

**超时机制**：`paid` 状态超过 24 小时未确认，自动退款并取消

**管理员权限**：可取消所有 `pending` 状态的订单

### 4.3 订单状态枚举

| 状态 | 说明 |
|------|------|
| `pending` | 待付款 |
| `paid` | 待确认收款 |
| `shipped` | 待收货 |
| `received` | 已完成 |
| `cancelled` | 已取消 |

### 4.4 评价规则

- 订单状态为 `received` 后，7 天内可评价
- 买家评价卖家：必评，星级（1-5）+ 文字
- 卖家评价买家：可选，仅星级
- 评价提交后不可修改，可追加评论（最多 1 次）

### 4.5 订单对象

```json
{
  "id": 1,
  "productId": 1,
  "productTitle": "二手笔记本",
  "buyerId": 2,
  "sellerId": 1,
  "price": 1500,
  "status": "pending",
  "createdAt": "2026-06-25T00:00:00.000Z"
}
```

---

## 五、模块四：评价与信誉体系

### 5.1 交易评价

- 交易完成后，买家对卖家进行评价（星级、文字）
- 信誉分算法由团队自行定义

### 5.2 用户主页

- 显示综合信誉分

### 5.3 管理员评价管理

- **隐藏**：评价对普通用户不可见，管理员和当事人可见，保留数据用于信誉分计算
- **删除**：仅逻辑删除，数据保留但标记为 deleted

### 5.4 评价对象

```json
{
  "id": 1,
  "orderId": 1,
  "rating": 5,
  "content": "卖家很靠谱",
  "reviewerId": 2,
  "createdAt": "2026-06-25T00:00:00.000Z"
}
```

---

## 六、模块五：后台管理（管理员）

### 6.1 用户管理

- 封禁/解封用户
- 重置密码

### 6.2 商品审核

- 对可疑商品进行下架（状态变为 `removed`）
- 对违规商品进行删除（逻辑删除，状态变为 `deleted`）

### 6.3 举报处理

举报对象：
```json
{
  "id": 1,
  "targetType": "product",
  "targetId": 1,
  "reason": "疑似假货",
  "reporterId": 2,
  "status": "pending",
  "createdAt": "2026-06-25T00:00:00.000Z"
}
```

举报状态：`pending`（待处理）、`resolved`（已处理）、`dismissed`（已驳回）

处理流程：
1. 用户举报 → 状态 `pending`，被举报内容标记"审核中"
2. 管理员处理：
   - `resolved`：内容违规，执行下架/删除
   - `dismissed`：误报，恢复标记

### 6.4 数据统计面板

展示内容：

| 指标 | 说明 |
|------|------|
| 商品总数 | 所有商品数量 |
| 订单总数 | 所有订单数量 |
| 用户数 | 注册用户总数 |
| 近一周交易额 | 近 7 天已完成订单金额总和 |
| 日交易额趋势 | 使用 ECharts 折线图展示 |

管理员统计响应：
```json
{
  "productCount": 100,
  "orderCount": 50,
  "userCount": 30,
  "weeklyVolume": 5600,
  "dailyVolume": [
    { "date": "6/19", "volume": 800 },
    { "date": "6/20", "volume": 950 }
  ]
}
```

---

## 七、模块六：开放 API

### 7.1 API 端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/login` | 用户登录 | 公开 |
| GET | `/api/products` | 商品列表（分页、搜索、筛选） | 公开 |
| GET | `/api/products/:id` | 商品详情 | 公开 |
| POST | `/api/products` | 发布商品 | JWT |
| PUT | `/api/products/:id` | 编辑商品 | JWT |
| DELETE | `/api/products/:id` | 删除商品 | JWT |
| POST | `/api/orders` | 创建订单 | JWT |
| GET | `/api/orders` | 查询订单列表 | JWT |
| GET | `/api/orders/:id` | 订单详情 | JWT |
| PUT | `/api/orders/:id/status` | 更新订单状态 | JWT |
| POST | `/api/reviews` | 提交评价 | JWT |
| GET | `/api/reviews` | 评价列表 | 公开 |
| POST | `/api/messages` | 发送留言 | JWT |
| GET | `/api/messages` | 留言列表 | 公开 |
| POST | `/api/reports` | 提交举报 | JWT |
| GET | `/api/admin/stats` | 管理员统计数据 | JWT + admin |
| PUT | `/api/admin/users/:id/ban` | 封禁用户 | JWT + admin |
| PUT | `/api/admin/users/:id/unban` | 解封用户 | JWT + admin |
| PUT | `/api/admin/products/:id/remove` | 强制下架商品 | JWT + admin |
| PUT | `/api/admin/reports/:id` | 处理举报 | JWT + admin |

### 7.2 CORS 配置

```js
app.use(cors({
  origin: ['https://campustrade.example.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 7.3 API 文档

使用 Markdown 格式编写 API 文档，包含每个端点的请求参数、响应格式、错误码说明。

---

## 八、模块七：CLI 工具（trade-cli）

### 8.1 运行模式

| 模式 | 说明 |
|------|------|
| 本地模式 | 直接操作内存数据库（开发调试） |
| API 模式 | 调用 RESTful API（生产环境，需管理员 Token） |

### 8.2 命令列表

| 命令 | 功能 | 参数 |
|------|------|------|
| `trade-cli product list` | 查看商品列表 | `--status`, `--limit` |
| `trade-cli product remove <id>` | 强制下架商品 | `--reason` |
| `trade-cli order export` | 导出订单报表 | `--format`, `--start`, `--end` |
| `trade-cli user ban <id>` | 封禁用户 | `--duration`, `--reason` |
| `trade-cli user unban <id>` | 解封用户 | 无 |
| `trade-cli stats` | 查看数据统计 | `--period` |
| `trade-cli config` | 配置 API 地址和 Token | `--api`, `--token` |

---

## 九、模块八：开放 Skill

### 9.1 自动定价 Skill

- 基于分类、成色、市场均价给出建议售价
- 定价算法由团队自行定义
- 作为独立功能单元，可被外部系统通过 API 调用

### 9.2 API 端点

```
POST /api/skills/recommend
```

请求：
```json
{
  "userId": 1,
  "limit": 5
}
```

响应：
```json
{
  "recommendations": [
    { "id": 1, "title": "商品名", "price": 100 }
  ]
}
```

### 9.3 调用文档

提供 Markdown 格式调用文档，说明请求参数、响应格式、示例代码。

---

## 十、全局规范

### 10.1 编码规范

| 项目 | 规范 |
|------|------|
| 组件文件命名 | PascalCase（如 `LoginPage.vue`） |
| JS/工具文件命名 | camelCase（如 `apiClient.js`） |
| 样式 | `<style scoped>`，禁止全局选择器 |
| 缩进 | 2 个空格，无 tab |
| 字符串 | 单引号 |
| 分号 | 必须添加 |
| 变量/函数 | camelCase |
| Vue 组件结构 | `<template>` → `<script setup>` → `<style scoped>` |

### 10.2 Axios 实例

```js
// @/utils/request.js
import axios from 'axios';

const request = axios.create({ baseURL: '/api', timeout: 10000 });

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default request;
```

### 10.3 目录结构

```
src/
├── api/            # 按模块拆分的 API 函数
├── views/          # 页面级组件
├── components/     # 公共组件
├── store/          # Pinia store
├── router/         # 路由配置
├── utils/          # 工具函数
├── styles/         # 全局 CSS 变量
├── App.vue
└── main.js
```

### 10.4 数据格式

- JSON 字段严格 camelCase
- 日期时间：ISO 8601 格式 `2026-06-25T10:30:00.000Z`
- 分页：请求 `page`（默认1）、`limit`（默认10）；响应 `{ items: [], total, page, limit }`
- 用户角色：`user` 或 `admin`
- JWT 存储：localStorage `token` 键

### 10.5 注释要求

- 文件顶部标注：`// AI 生成，手动调整：描述修改部分`
- 关键业务逻辑添加中文注释

### 10.6 生成约束

- 只生成要求的具体组件/模块
- 不假设未提及的库或文件
- 引用其他文件时明确写出 import 路径
- 不使用 TypeScript，保持纯 JavaScript
