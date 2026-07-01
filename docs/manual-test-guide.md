# 模块 7 & 模块 8 手动测试指南

本指南面向初学者，从零开始一步步带你手动测试 **模块 7（CLI 命令行工具）** 和 **模块 8（自动定价 Skill）**。

---

## 目录

- [准备工作](#准备工作)
- [模块 8：自动定价 Skill](#模块-8自动定价-skill)
  - [8.1 API 端点说明](#81-api-端点说明)
  - [8.2 用 curl 测试定价推荐接口](#82-用-curl-测试定价推荐接口)
  - [8.3 定价算法四大分支测试](#83-定价算法四大分支测试)
  - [8.4 测试错误处理](#84-测试错误处理)
  - [8.5 测试元数据接口](#85-测试元数据接口)
- [模块 7：CLI 命令行工具](#模块-7cli-命令行工具)
  - [7.1 获取管理员 Token](#71-获取管理员-token)
  - [7.2 商品命令](#72-商品命令)
  - [7.3 订单命令](#73-订单命令)
  - [7.4 用户命令](#74-用户命令)
  - [7.5 统计命令](#75-统计命令)
  - [7.6 配置命令](#76-配置命令)
- [常见问题排错](#常见问题排错)

---

## 准备工作

你需要 **两个终端窗口**，一个启动后端，一个执行命令。

### 终端 1 —— 启动后端服务器

```bash
npm run server
```

看到以下输出表示启动成功：

```
CampusTrade 后端已启动: http://localhost:3000
管理员账号: admin@campus.edu / admin123
普通用户:   user@campus.edu  / user123
```

后台**不要关闭**这个终端。

### 种子数据

服务器内置 5 件商品、4 笔订单。数据存放在 `server/db.js`，每次重启服务器都会重置。

### 测试账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@campus.edu | admin123 |
| 普通用户 | user@campus.edu | user123 |
| 普通用户 | lisi@campus.edu | user123 |

---

## 模块 8：自动定价 Skill

模块 8 是一个基于分类、成色、原价和市场价格给出二手商品建议售价的算法。它通过 HTTP API 对外暴露。

源代码：
- `src/skills/pricingData.js` — 数据常量（分类折扣率、成色折旧因子）
- `src/skills/pricing.js` — 核心定价算法
- `src/skills/pricingRoutes.js` — Express 路由

### 8.1 API 端点说明

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `http://localhost:3000/api/skills/recommend` | 请求定价建议 |
| GET | `http://localhost:3000/api/skills/recommend/meta` | 获取分类和成色的元数据 |

#### 请求参数（POST）

```json
{
  "category": "电子产品",
  "condition": "轻微使用",
  "originalPrice": 4399,
  "marketPrices": [1800, 2200, 2000, 2100, 1950]
}
```

| 字段 | 必填 | 说明 | 可选值 |
|------|------|------|--------|
| category | 是 | 商品分类 | 书籍、电子产品、生活用品、衣物、其他 |
| condition | 是 | 成色等级 | 全新、几乎全新、轻微使用、明显使用、老旧 |
| originalPrice | 否 | 原价（元） | 任意正数 |
| marketPrices | 否 | 市场参考价数组 | 数字数组 |

#### 响应格式

```json
{
  "success": true,
  "suggestedPrice": 1676.0,
  "priceRange": { "min": 1550.0, "max": 1802.0 },
  "confidence": 0.85,
  "reasoning": "电子产品类二手基准折扣率约55%...",
  "breakdown": {
    "categoryBaseRate": 0.55,
    "conditionFactor": 0.6,
    "marketAverage": 2010.0,
    "marketAdjustment": true
  }
}
```

### 8.2 用 curl 测试定价推荐接口

打开**终端 2**（保持终端 1 运行），执行以下命令。

#### 最简单的请求（仅分类 + 成色）

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"生活用品\",\"condition\":\"明显使用\"}"
```

**预期响应**（无原价和市场参考，置信度最低）：

```json
{
  "success": true,
  "suggestedPrice": 16.0,
  "priceRange": { "min": 13.44, "max": 18.56 },
  "confidence": 0.2,
  "reasoning": "生活用品类二手基准折扣率约40%（实用性商品，折旧取决于外观磨损程度）。明显使用折旧因子为40%。无原价和市场参考，仅给出归一化指数",
  "breakdown": {
    "categoryBaseRate": 0.4,
    "conditionFactor": 0.4,
    "marketAverage": null,
    "marketAdjustment": false
  }
}
```

### 8.3 定价算法四大分支测试

定价算法根据输入参数的不同，走四条不同的计算分支。依次测试：

#### 分支①：原价 + 市场参考（置信度最高，0.85）

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"电子产品\",\"condition\":\"轻微使用\",\"originalPrice\":4399,\"marketPrices\":[1800,2200,2000,2100,1950]}"
```

**关键点验证**：
- `confidence` 应为 `0.85`
- `marketAverage` 应为 `2010`（5 个市场价的平均值）
- `suggestedPrice` 应为原价计算值与市场均价的 6:4 加权（约 `1676.00`）

#### 分支②：仅有原价（置信度 0.60）

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"书籍\",\"condition\":\"几乎全新\",\"originalPrice\":49}"
```

**关键点验证**：
- `confidence` 应为 `0.6`
- `suggestedPrice` = 49 × 0.45 × 0.8 = `17.64`
- reasoning 中应包含 "仅基于原价和折旧模型计算"

#### 分支③：仅有市场参考（置信度 0.50）

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"电子产品\",\"condition\":\"轻微使用\",\"marketPrices\":[1500,1800,1650]}"
```

**关键点验证**：
- `confidence` 应为 `0.5`
- `suggestedPrice` = (1500 + 1800 + 1650) / 3 = `1650.00`
- `originalPrice` 未提供，走市场均价分支

#### 分支④：仅有分类 + 成色（置信度最低，0.20）

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"衣物\",\"condition\":\"全新\"}"
```

**关键点验证**：
- `confidence` 应为 `0.2`
- `suggestedPrice` = 0.35 × 0.95 × 100 = `33.25`
- `reasoning` 中应包含 "仅给出归一化指数"

### 8.4 测试错误处理

#### 无效分类

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"食品\",\"condition\":\"全新\"}"
```

**预期**：`{ "success": false, "error": "无效分类，可选值：..." }`

#### 无效成色

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"书籍\",\"condition\":\"不知道\"}"
```

**预期**：`{ "success": false, "error": "无效成色，可选值：..." }`

#### 空请求体

```bash
curl -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{}"
```

**预期**：`{ "success": false, "error": "无效分类，可选值：..." }`

### 8.5 测试元数据接口

```bash
curl http://localhost:3000/api/skills/recommend/meta
```

**预期响应**：

```json
{
  "categories": ["书籍", "电子产品", "生活用品", "衣物", "其他"],
  "conditions": ["全新", "几乎全新", "轻微使用", "明显使用", "老旧"],
  "baseRates": { "书籍": 0.45, "电子产品": 0.55, "生活用品": 0.4, "衣物": 0.35, "其他": 0.45 },
  "conditionFactors": { "全新": 0.95, "几乎全新": 0.8, "轻微使用": 0.6, "明显使用": 0.4, "老旧": 0.25 }
}
```

---

## 模块 7：CLI 命令行工具

CLI 是管理员命令行工具，用于管理商品、订单、用户。它通过 HTTP API 与后端通信。

### 7.1 获取管理员 Token

大多数 CLI 命令需要管理员 Token。先登录获取 Token：

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@campus.edu\",\"password\":\"admin123\"}"
```

响应类似：

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR...","user":{"id":1,...}}
```

复制 `token` 字段的值（不含引号），后面会用到。把它保存到一个变量中便于使用：

**Windows PowerShell:**

```powershell
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR..."
```

**macOS / Linux Bash:**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR..."
```

---

### 7.2 商品命令

#### `products list` — 列出所有商品（无需 Token）

```bash
npm run cli -- products list
```

**预期**：显示 5 件商品的信息表格，包含 ID、标题、价格、分类、成色。

#### `products list` — 分页查看

```bash
npm run cli -- products list -l 2 -p 1
```

`-l 2` 表示每页 2 条，`-p 1` 表示第 1 页。**预期**：只显示 2 件商品。

#### `products list` — 按分类筛选

```bash
npm run cli -- products list -c 书籍
```

**预期**：只显示 `高等数学教材第七版` 和 `Python编程从入门到实践`。

#### `products list` — 关键词搜索

```bash
npm run cli -- products list -s Python
```

**预期**：只显示 `Python编程从入门到实践`，且标题匹配权重更高排在前面。

#### `products search` — 直接搜索

```bash
npm run cli -- products search 键盘
```

**预期**：显示包含 "键盘" 的商品（机械键盘 Keychron K2）。

```bash
npm run cli -- products search xyznotfound999
```

**预期**：`未找到包含 "xyznotfound999" 的商品`

#### `products remove` — 强制下架商品（需要 Token）

```bash
npm run cli -- -t %TOKEN% products remove 1 -r "测试下架"
```

**预期**：`✔ 操作成功`，`下架原因: 测试下架`

验证是否下架成功：

```bash
npm run cli -- products search 高等数学
```

**预期**：下架后的商品不会出现在公共搜索结果中（只有 `status=active` 的商品才能被搜到）。

---

### 7.3 订单命令

#### `orders export` — 导出 CSV（需要 Token）

```bash
npm run cli -- -t %TOKEN% orders export
```

**Windows** 替换 `%TOKEN%` 为你的实际 Token；**Mac/Linux** 替换 `$TOKEN`。

**预期**：
- `✓ 报表已导出: D:\...\orders_export.csv`
- 显示各状态订单的摘要统计

打开生成的 CSV 文件，**验证**：
- 第一行为表头：`订单ID,商品名称,商品类别,买家ID,卖家ID,状态,金额,创建时间`
- 数据行的状态列显示中文（如 `已完成`、`已取消`）

#### `orders export` — 导出 JSON

```bash
npm run cli -- -t %TOKEN% orders export -f json
```

**预期**：生成 `.json` 文件，内含订单数组。

#### `orders export` — 指定输出路径

```bash
npm run cli -- -t %TOKEN% orders export -o ./my_orders.csv
```

**预期**：文件生成在指定的 `my_orders.csv` 路径。

#### `orders export` — 按状态筛选

```bash
npm run cli -- -t %TOKEN% orders export -s received -o received_orders.csv
```

**预期**：只导出状态为 `received`（已完成）的订单，摘要中也只显示已完成。

#### `orders export` — 按日期范围筛选

```bash
npm run cli -- -t %TOKEN% orders export --start 2026-06-25 --end 2026-06-26 -o june_orders.csv
```

**预期**：只导出 `2026-06-25` 到 `2026-06-26` 之间创建的订单。

#### `orders export` — 无 Token 应报 401

```bash
npm run cli -- orders export
```

**预期**：`错误 [401]: ...`（订单列表需要登录）

---

### 7.4 用户命令

#### `users ban` — 封禁用户（需要管理员 Token）

```bash
npm run cli -- -t %TOKEN% users ban 3 -r "测试封禁"
```

**预期**：
- `✔ 封禁成功`
- `用户ID: 3`
- `用户名: 李四`

#### `users unban` — 解封用户

```bash
npm run cli -- -t %TOKEN% users unban 3
```

**预期**：
- `✔ 解封成功`
- `用户ID: 3`

#### `users ban` — 封禁不存在用户

```bash
npm run cli -- -t %TOKEN% users ban 999
```

**预期**：`错误 [404]: 用户不存在`

#### `users ban` — 无 Token 报错

```bash
npm run cli -- users ban 3
```

**预期**：`错误 [401]` 或退出码非 0

---

### 7.5 统计命令

#### `stats` — 查看平台数据（需要管理员 Token）

```bash
npm run cli -- -t %TOKEN% stats
```

**预期**：

```
CampusTrade 平台统计
────────────────────────────────────────────────────────────────
 商品总数:  5
 订单总数:  4
 用户总数:  3
 近一周交易额: ...
────────────────────────────────────────────────────────────────
```

#### `stats` — 带周期选项

```bash
npm run cli -- -t %TOKEN% stats -p week
```

**预期**：除基本统计外，还会显示每天的交易额趋势。

#### `stats` — 无 Token 报错

```bash
npm run cli -- stats
```

**预期**：退出码非 0

---

### 7.6 配置命令

#### `config` — 保存 Token

```bash
npm run cli -- config --token %TOKEN%
```

**预期**：`✔ Token 已保存`

Token 保存后，后续命令无需重复 `-t %TOKEN%` 参数：

```bash
npm run cli -- stats
```

如果之前已通过 `config` 保存 Token，这个命令应该能直接执行。

#### `config` — 查看当前配置

```bash
npm run cli -- config
```

**预期**：显示当前的 API 地址和 Token。

#### `config` — 设置 API 地址

```bash
npm run cli -- config --api http://localhost:3000/api
```

**预期**：`✔ API 地址已设置为: http://localhost:3000/api`

---

## 📝 手动测试检查清单

### 模块 8

- [ ] POST `/api/skills/recommend` — 四参数（原价+市场）返回 `confidence: 0.85`
- [ ] POST `/api/skills/recommend` — 仅有分类+成色返回 `confidence: 0.20`
- [ ] POST `/api/skills/recommend` — 无效分类返回 `success: false`
- [ ] POST `/api/skills/recommend` — 无效成色返回 `success: false`
- [ ] POST `/api/skills/recommend` — 空 body 返回 `success: false`
- [ ] POST `/api/skills/recommend` — `suggestedPrice` 始终保留两位小数
- [ ] GET `/api/skills/recommend/meta` — 返回 5 分类、5 成色、折扣率、折旧因子

### 模块 7

- [ ] `products list` — 无需 Token，列出商品
- [ ] `products list -c 书籍` — 分类筛选
- [ ] `products search Python` — 关键词搜索
- [ ] `products search xyz` — 无结果提示 `未找到`
- [ ] `products remove 1 -r "原因"` — 管理员下架商品
- [ ] `orders export` — CSV 导出，含 BOM 头和中文字段
- [ ] `orders export -f json` — JSON 导出
- [ ] `orders export -s received` — 按状态筛选
- [ ] `orders export --start ... --end ...` — 日期过滤
- [ ] `users ban 3` — 封禁用户
- [ ] `users unban 3` — 解封用户
- [ ] `stats` — 显示平台统计数据
- [ ] `config --token ...` — 保存配置

---

## 常见问题排错

### Q: `ECONNREFUSED` 错误

```
错误: 无法连接到后端服务器。请确认 server.js 已启动：npm run server
```

**解决**：确保终端 1 中 `npm run server` 正在运行且没有报错。

### Q: `curl` 命令不可用（Windows）

Windows PowerShell 中 curl 是 `Invoke-WebRequest` 的别名。使用以下等效命令：

```powershell
$body = '{"category":"生活用品","condition":"明显使用"}'
Invoke-RestMethod -Uri http://localhost:3000/api/skills/recommend -Method POST -Body $body -ContentType "application/json"
```

或者将 curl 命令改为原生 curl 用法：

```powershell
curl.exe -X POST http://localhost:3000/api/skills/recommend -H "Content-Type: application/json" -d "{\"category\":\"生活用品\",\"condition\":\"明显使用\"}"
```

### Q: `401 未登录` 错误

表示命令需要 Token 但没有提供。使用 `-t` 参数传入 Token，或者先用 `config --token` 保存。

### Q: `403 权限不足` 错误

表示当前 Token 所属用户不是管理员。普通用户 Token 无法执行管理操作。使用管理员账号 `admin@campus.edu` 重新登录获取 Token。

### Q: 数据被修改了想恢复

重启后端服务器即可恢复种子数据：

1. 在终端 1 按 `Ctrl+C` 停止服务器
2. 重新执行 `npm run server`

### Q: Token 过期

Token 有效期 7 天。如果提示过期，重新执行登录命令获取新 Token。

### Q: 如何查看 Token 是否保存成功

```bash
npm run cli -- config
```

没有设置时 Token 显示为空或 `undefined`。
