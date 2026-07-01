# CampusTrade API 文档

## 基础信息
- 基础 URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 第三方开放 API: 携带 `x-api-key: campus-trade-2026-public` 头（仅 GET 请求需要）
- 响应格式: JSON，所有字段采用 camelCase

## 用户认证（模块1）
### POST /api/auth/register
- 请求体: `{ email?, phone?, password, nickname, school }`（邮箱和手机号至少填一项）
- 响应: `{ message: "注册成功", userId: 1 }`

### POST /api/auth/login
- 请求体: `{ email, password }`
- 响应: `{ token: "...", user: { id, email, nickname, ... } }`
- 锁定: 5次失败冻结30分钟，10次冻结24小时

### POST /api/auth/forgot-password
- 请求体: `{ email }`
- 响应: `{ message: "验证码已发送至邮箱/手机，请在10分钟内完成验证" }`

### POST /api/auth/reset-password
- 请求体: `{ email, code, newPassword }`
- 响应: `{ message: "密码重置成功" }`

## 用户信息（模块1）
### GET /api/user/profile
- 头部: Authorization
- 响应: `{ user: { id, email, nickname, school, avatarUrl, contact, role, reputationScore } }`

### PUT /api/user/profile
- 请求体: `{ nickname?, school?, avatarUrl?, contact?, phone?, email?, contactVisible? }`
- 响应: `{ user: ... }`

### PUT /api/user/password
- 请求体: `{ oldPassword, newPassword }`
- 响应: `{ message: "密码修改成功" }`

## 商品（模块2 & 6）
### GET /api/products
- 查询参数: `page`(默认1), `limit`(默认10), `keyword`, `category`, `sort`(price_asc|price_desc|newest|popular), `minPrice`, `maxPrice`, `status`, `mine`
- 响应: `{ products: [...], total, page, limit }`
- 搜索权重: title 权重 2, description 权重 1

### GET /api/products/:id
- 响应: `{ product: {...}, comments: [...] }`

### POST /api/products
- 请求体: `{ title, description, category, price, originalPrice?, condition?, images? }`
- 限制: 管理员不可发布商品
- 响应: `{ product: {...} }`

### PUT /api/products/:id
- 请求体: 同上（部分字段可选）或 `{ status: 'active'|'removed' }`

### DELETE /api/products/:id
- 物理删除（从数组中移除，清理关联留言）

### GET /api/products/:productId/comments
- 查询参数: `page`, `limit`
- 响应: `{ comments: [...], total, page, limit }`

### POST /api/products/:productId/comments
- 请求体: `{ content, parentId? }`
- 响应: `{ comment: {...} }`

## 订单（模块3）
### POST /api/orders
- 请求体: `{ productId }`
- 响应: `{ order: {...} }`

### GET /api/orders
- 查询参数: `role`(buyer|seller), `status`(可选), `page`, `limit`
- 响应: `{ orders: [...], total, page, limit }`

### GET /api/orders/:id
- 响应: `{ order: {...} }`

### PUT /api/orders/:id/status
- 请求体: `{ status: 'paid'|'shipped'|'received'|'cancelled' }`
- 状态机: pending→paid→shipped→received, pending/paid→cancelled

### POST /api/orders/:id/pay
- 响应: `{ message: "支付成功", order: {...} }`

## 评价（模块4）
### POST /api/orders/:id/review
- 请求体: `{ rating: 1-5, content? }`
- 限制: 仅买家可评价已完成的订单
- 响应: `{ review: {...} }`

### GET /api/users/:id/reputation
- 响应: `{ userId, reputationScore, reviewCount }`

## 举报（模块5）
### POST /api/reports
- 请求体: `{ targetType: 'product'|'user'|'comment', targetId, reason }`
- 响应: `{ message: "举报已提交", report: {...} }`

## 管理后台（模块5）
### GET /api/admin/stats
- 响应: `{ productCount, orderCount, userCount, weeklyVolume, dailyVolume: [{ date, volume }], recentOrders, totalProducts, totalOrders, totalUsers }`

### GET /api/admin/products
- 响应: `{ products: [...], total, page, limit }`

### PUT /api/admin/products/:id
- 请求体: `{ status }`

### DELETE /api/admin/products/:id
- 物理删除（管理员删除）

### GET /api/admin/users
- 响应: `{ users: [...], total, page, limit }`

### PUT /api/admin/users/:id
- 请求体: `{ action: 'ban'|'unban'|'reset_password' }`

### GET /api/admin/reports
- 响应: `{ reports: [...], total, page, limit }`

### GET /api/admin/reports/:id
- 响应: `{ report: { ...reporterNickname, targetDetail } }`

### PUT /api/admin/reports/:id
- 请求体: `{ status: 'resolved'|'dismissed' }`
- 响应: `{ message: "处理成功", report }`

### GET /api/admin/reviews
- 响应: `{ reviews: [...], total }`

### DELETE /api/admin/reviews/:id
- 响应: `{ message: "评价已删除" }`

### DELETE /api/admin/comments/:id
- 响应: `{ message: "留言已删除", deletedCount }`

## 开放 Skill（模块8）
### POST /api/skills/recommend
- 请求体: `{ category, condition, originalPrice?, marketPrices? }`
- 响应: `{ success, suggestedPrice, priceRange: { min, max }, confidence, reasoning, breakdown }`

### GET /api/skills/recommend/meta
- 响应: `{ categories, conditions, baseRates, conditionFactors }`

## 上传
### POST /api/upload
- 头部: Authorization
- 格式: multipart/form-data
- 响应: `{ url: "/uploads/xxx.jpg" }`
