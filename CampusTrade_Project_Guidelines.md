# CampusTrade 项目全局规范

你正在参与校园二手交易平台 **CampusTrade** 项目。生成代码必须严格遵守以下规范。

---

## 一、技术栈（不可更改）

- **前端**：Vue3（Composition API，`<script setup>` 语法），UI 组件库 Element Plus，状态管理 Pinia，HTTP 请求 Axios，构建工具 Vite。
- **后端**：Node.js + Express，提供 RESTful API。
- **数据库**：暂时使用内存数组存储，但字段设计需与最终数据库一致。
- **其他**：ECharts（图表），Commander.js（CLI工具），JWT 认证。
- **不使用 TypeScript，只用纯 JavaScript**。

---

## 二、编码规范

| 项目 | 规范 |
|------|------|
| 组件文件命名 | PascalCase（如 `LoginPage.vue`） |
| JS/工具文件命名 | camelCase（如 `apiClient.js`） |
| 样式 | 所有组件样式必须使用 `<style scoped>`，禁止全局选择器（除非定义在全局 CSS 变量文件中） |
| 缩进 | 2 个空格，无 tab |
| 字符串 | 统一使用单引号 |
| 分号 | 必须添加 |
| 变量/函数命名 | 驼峰命名（camelCase） |
| Vue 组件结构顺序 | `<template>` → `<script setup>` → `<style scoped>` |
| API 调用 | 统一使用 `@/utils/request`，已配置 `baseURL: '/api'` 和 JWT 拦截器，禁止自建 Axios |

### 统一 Axios 实例

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

---

## 三、目录结构

```
src/
├── api/            # 按模块拆分的 API 函数，如 auth.js、products.js
├── views/          # 页面级组件，可创建子文件夹
├── components/     # 公共组件
├── store/          # Pinia store 模块，如 userStore.js
├── router/         # 路由配置，modules/ 下放子模块路由
├── utils/          # 工具函数，如 request.js
├── styles/         # 全局 CSS 变量（可选）
├── App.vue
└── main.js
```

---

## 四、数据格式约定

- 所有 API 请求和响应使用 JSON，字段命名严格采用 **camelCase**（如 `productId`, `createdAt`）。
- 日期时间统一为 ISO 8601 字符串格式：`2026-06-25T10:30:00.000Z`。
- 分页接口统一使用：请求参数 `page`（默认 1）、`limit`（默认 10），响应格式：`{ items: [], total: number, page: number, limit: number }`。注意：键名用 `items` 还是 `products` 等取决于具体接口，但格式一致。
- 用户角色：`'user'` 或 `'admin'`。
- JWT token 存储在 localStorage 的 `token` 键中。

---

## 五、已确定的 API 端点与数据字段

### 用户对象

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

### 商品对象

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

商品状态枚举：`active`（在售）、`removed`（已下架）、`deleted`（已删除）。

### 订单对象

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

订单状态枚举：`pending`（待付款）、`paid`（待发货）、`shipped`（待收货）、`received`（已完成）、`cancelled`（已取消）。

### 评价对象

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

### 留言/评论对象（用于商品详情）

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

### 管理员统计响应（`GET /api/admin/stats`）

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

### 举报对象

```json
{
  "id": 1,
  "targetType": "product",
  "targetId": 1,
  "reason": "疑似假货",
  "reporterId": 2,
  "status": "pending",
  "createdAt": "..."
}
```

举报状态：`pending`（待处理）、`resolved`（已处理）、`dismissed`（已驳回）。

### 推荐 Skill 请求/响应

- 请求：`POST /api/skills/recommend` body: `{ "userId": 1, "limit": 5 }`
- 响应：`{ "recommendations": [ { "id": 1, "title": "商品名", "price": 100 } ] }`

### 分页列表接口通用响应

以商品为例，`GET /api/products` 返回：

```json
{
  "products": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

其他列表接口（如订单列表）使用类似结构，`items` 键根据语境可能是 `orders`。

---

## 六、AI 生成代码的注释要求

- 在文件顶部或代码块上方，用注释标明：`// AI 生成，手动调整：描述修改部分`
- 为关键业务逻辑添加清晰的中文注释（如状态流转条件、分页计算等），方便团队成员理解。

---

## 七、生成要求

- 只生成要求的具体组件/模块代码，不要添加额外的无关功能。
- 不要假设任何未提及的库或文件。
- 如果代码需要引用其他文件（如 Pinia store），请明确写出 import 路径。
- 代码中请勿使用 `any`（TypeScript），保持纯 JavaScript。

---

> 已理解项目规范，准备生成代码。请给出具体需求。
