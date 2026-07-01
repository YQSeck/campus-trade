# CampusTrade API 文档

## 基础信息
- 基础 URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 响应格式: JSON，所有字段采用 camelCase

## 用户认证（模块1）
### POST /api/auth/register
- 请求体: `{ email, password, nickname, school }`
- 响应: `{ message: "注册成功", userId: 1 }`

### POST /api/auth/login
- 请求体: `{ email, password }`
- 响应: `{ token: "...", user: { id, email, nickname, ... } }`

### POST /api/auth/forgot-password
- 请求体: `{ email }`
- 响应: `{ message: "新密码已发送至邮箱" }`

## 用户信息（模块1）
### GET /api/user/profile
- 头部: Authorization
- 响应: `{ user: { id, email, nickname, school, avatarUrl, contact, role, reputationScore } }`

### PUT /api/user/profile
- 请求体: `{ nickname?, school?, avatarUrl?, contact? }`
- 响应: `{ user: ... }`

## 商品（模块2 & 6）
### GET /api/products
- 查询参数: `page`(默认1), `limit`(默认10), `search`, `category`, `priceOrder`(asc|desc)
- 响应: `{ products: [...], total, page, limit }`

### GET /api/products/:id
- 响应: `{ product: {...}, comments: [...] }`

### POST /api/products
- 请求体: `{ title, description, category, price, originalPrice, condition, images }`
- 响应: `{ product: {...} }`

### PUT /api/products/:id
- 请求体: 同上（部分字段可选）或 `{ status: 'active'|'removed' }`

### DELETE /api/products/:id

### POST /api/products/:id/comments
- 请求体: `{ content }`
- 响应: `{ comment: {...} }`

## 订单（模块3）
### POST /api/orders
- 请求体: `{ productId }`
- 响应: `{ order: {...} }`

### GET /api/orders
- 查询参数: `role`(buyer|seller), `status`(可选)
- 响应: `{ orders: [...], total, page, limit }`

### PUT /api/orders/:id/status
- 请求体: `{ status: 'paid'|'shipped'|'received'|'cancelled' }`

## 评价（模块4）
### POST /api/orders/:id/review
- 请求体: `{ rating: 1-5, content }`

## 管理后台（模块5）
### GET /api/admin/stats
- 响应: `{ productCount, orderCount, userCount, weeklyVolume, dailyVolume: [{ date, volume }] }`

### GET /api/admin/users
- 响应: `{ users: [...] }`

### PUT /api/admin/users/:id
- 请求体: `{ action: 'ban'|'unban'|'reset_password' }`

### GET /api/admin/reports
- 响应: `{ reports: [...] }`

### PUT /api/admin/reports/:id
- 请求体: `{ status: 'resolved'|'dismissed' }`

## 开放 Skill（模块8）
### POST /api/skills/recommend
- 请求体: `{ category, condition, originalPrice?, marketPrices? }`
- 响应: `{ success, suggestedPrice, priceRange: { min, max }, confidence, reasoning, breakdown }`

### GET /api/skills/recommend/meta
- 响应: `{ categories, conditions, baseRates, conditionFactors }`

## 上传
### POST /api/upload
- 格式: multipart/form-data
- 响应: `{ url: "/uploads/xxx.jpg" }`
