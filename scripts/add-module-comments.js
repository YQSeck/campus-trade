
const fs = require('fs');
const path = require('path');

const mapping = {
  'server/db.js': '【公共基础】统一内存数据库，供各模块共享',
  'server/middleware.js': '【公共基础】JWT 鉴权、密码加密、账号规范化',
  'server/data.js': '【公共基础】数据层兼容导出（指向 db.js）',
  'server/index.js': '【模块六：开放 API】Express 服务入口，CORS 与路由挂载',
  'server.js': '【模块六：开放 API】后端启动入口（转发 server/index.js）',
  'server/routes/auth.js': '【模块一：用户系统】注册、登录、忘记密码、个人信息、密码修改',
  'server/routes/users.js': '【模块一/四/五/七】用户信誉、封禁解封（CLI 兼容）',
  'server/routes/products.js': '【模块二：商品发布与管理】商品 CRUD、搜索筛选',
  'server/routes/comments.js': '【模块三：交易与订单】商品留言与卖家回复',
  'server/routes/orders.js': '【模块三：交易与订单】下单、支付、发货、收货',
  'server/routes/reviews.js': '【模块四：评价与信誉体系】订单评价与信誉分更新',
  'server/routes/admin.js': '【模块五：后台管理】统计、审核、用户管理、举报、评价管理',
  'server/routes/reports.js': '【模块五：后台管理】用户提交举报',
  'src/skills/pricing.js': '【模块八：开放 Skill】自动定价引擎',
  'src/skills/pricingData.js': '【模块八：开放 Skill】定价参考常量',
  'src/skills/pricingRoutes.js': '【模块八：开放 Skill】定价 API 路由',
  'cli/tradeCli.js': '【模块七：CLI】命令行工具入口',
  'cli/apiClient.js': '【模块七：CLI】HTTP 客户端与 Token 管理',
  'cli/commands/products.js': '【模块七：CLI】商品列表与搜索命令',
  'cli/commands/orders.js': '【模块七：CLI】订单报表导出命令',
  'cli/commands/users.js': '【模块七：CLI】用户封禁/解封命令',
  'src/main.js': '【公共基础】Vue 应用入口',
  'src/App.vue': '【公共基础】根组件',
  'src/router/index.js': '【公共基础】路由注册与登录守卫',
  'src/router/modules/product.js': '【模块一/二】首页、商品、发布、个人中心路由',
  'src/router/modules/orders.js': '【模块三：交易与订单】订单页面路由',
  'src/router/modules/admin.js': '【模块五：后台管理】管理员面板路由',
  'src/store/index.js': '【公共基础】Pinia 初始化',
  'src/store/useUserStore.js': '【模块一：用户系统】登录态与用户信息 Store',
  'src/store/userStore.js': '【模块一：用户系统】用户 Store（旧版，兼容保留）',
  'src/utils/request.js': '【模块六：开放 API】Axios 实例与 JWT 拦截器',
  'src/utils/account.js': '【模块一：用户系统】邮箱/手机号规范化与校验',
  'src/utils/image.js': '【模块二：商品发布与管理】图片压缩工具',
  'src/constants/categories.js': '【模块二：商品发布与管理】商品分类常量',
  'src/api/auth.js': '【模块一：用户系统】认证与个人资料 API',
  'src/api/product.js': '【模块二：商品发布与管理】商品 API',
  'src/api/products.js': '【模块六：开放 API】商品列表 API（第三方调用封装）',
  'src/api/orders.js': '【模块三：交易与订单】订单 API',
  'src/api/comments.js': '【模块三：交易与订单】商品留言 API',
  'src/api/reviews.js': '【模块四：评价与信誉体系】评价 API',
  'src/api/admin.js': '【模块五：后台管理】管理员 API',
  'src/components/LoginDialog.vue': '【模块一：用户系统】登录弹窗',
  'src/components/RegisterDialog.vue': '【模块一：用户系统】注册弹窗',
  'src/components/ForgotPassword.vue': '【模块一：用户系统】忘记密码弹窗',
  'src/components/HelloWorld.vue': '【公共基础】示例组件',
  'src/views/user/Profile.vue': '【模块一/四】个人中心（含信誉分展示）',
  'src/views/user/MyProducts.vue': '【模块二：商品发布与管理】我的发布列表',
  'src/views/products/ProductList.vue': '【模块二：商品发布与管理】商品列表与搜索',
  'src/views/products/ProductDetail.vue': '【模块二/三】商品详情、留言、下单',
  'src/views/products/PublishProduct.vue': '【模块二：商品发布与管理】发布/编辑商品',
  'src/views/orders/OrderList.vue': '【模块三：交易与订单】订单列表',
  'src/views/orders/OrderDetail.vue': '【模块三/四】订单详情与评价',
  'src/views/admin/AdminPanel.vue': '【模块五：后台管理】管理员面板',
  'vite.config.js': '【模块六：开放 API】Vite 开发服务器与 /api 代理',
  'demo-client.html': '【模块六：开放 API】第三方调用示例页面',
  'tests/module7-cli/apiClient.test.js': '【模块七：CLI】apiClient 单元测试',
  'tests/module7-cli/cli.integration.test.js': '【模块七：CLI】CLI 集成测试',
  'tests/module7-cli/orders.test.js': '【模块七：CLI】订单导出单元测试',
  'tests/module8-skill/pricing.test.js': '【模块八：开放 Skill】定价引擎单元测试',
  'tests/module8-skill/pricingData.test.js': '【模块八：开放 Skill】定价数据单元测试',
  'tests/module8-skill/pricingApi.test.js': '【模块八：开放 Skill】定价 API 测试',
};

function stripOldHeaders(content) {
  let result = content;
  const patterns = [
    /^\/\/ 【[^\n]+\n/m,
    /^<!-- 【[^\n]+ -->\n/m,
    /^\/\/ AI 生成[^\n]*\n/m,
    /^<!-- AI 生成[^\n]* -->\n/m,
    /^\/\/ AI 合并[^\n]*\n/m,
    /^<!-- AI 合并[^\n]* -->\n/m,
    /^<!-- AI 生成，手动调整[^\n]* -->\n/m,
  ];
  patterns.forEach((re) => {
    result = result.replace(re, '');
  });
  return result;
}

function addModuleComment(filePath, desc) {
  const full = path.join(process.cwd(), filePath);
  if (!fs.existsSync(full)) {
    console.log('Skip (missing):', filePath);
    return;
  }

  let content = stripOldHeaders(fs.readFileSync(full, 'utf8'));
  const ext = path.extname(filePath);

  if (ext === '.vue') {
    content = `<!-- ${desc} -->\n<!-- AI 生成：手动调整前请勿修改 -->\n${content}`;
  } else if (ext === '.html') {
    content = content.replace(
      '<!DOCTYPE html>',
      `<!DOCTYPE html>\n<!-- ${desc} -->\n<!-- AI 生成：手动调整前请勿修改 -->`
    );
  } else {
    content = `// ${desc}\n// AI 生成：手动调整前请勿修改\n${content}`;
  }

  fs.writeFileSync(full, content, 'utf8');
  console.log('Updated:', filePath);
}

Object.entries(mapping).forEach(([file, desc]) => addModuleComment(file, desc));
