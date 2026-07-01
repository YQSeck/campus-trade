// 【模块二：商品管理】自动化测试
// AI 生成：手动调整前请勿修改
var { describe, it, before, after } = require('node:test');
var assert = require('node:assert/strict');
var http = require('http');

var PORT = 3097;
var HOST = '127.0.0.1';

var app;
var server;

// ---------- helpers ----------

function request(method, path, body, headers) {
  return new Promise(function (resolve, reject) {
    var data = body ? JSON.stringify(body) : null;
    var options = {
      hostname: HOST,
      port: PORT,
      path: encodeURI('/api' + path),
      method: method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    };
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    var req = http.request(options, function (res) {
      var chunks = [];
      res.on('data', function (c) {
        chunks.push(c);
      });
      res.on('end', function () {
        var text = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(text) });
        } catch (_) {
          resolve({ status: res.statusCode, body: text });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

function authHeaders(token) {
  return { Authorization: 'Bearer ' + token };
}

function registerAndLogin(email, phone, password, nickname) {
  return request('POST', '/auth/register', {
    email: email,
    phone: phone,
    password: password,
    nickname: nickname,
    school: '测试大学',
  }).then(function () {
    return request('POST', '/auth/login', {
      email: email,
      password: password,
    });
  }).then(function (loginRes) {
    return loginRes.body.token;
  });
}

// ---------- lifecycle ----------

before(function (_, done) {
  // 清除所有 server 相关模块缓存，确保每次测试文件启动时 db 为全新状态
  Object.keys(require.cache).forEach(function (key) {
    if (
      key.includes('\\server\\') ||
      key.includes('/server/') ||
      key.includes('\\server.js') ||
      key.includes('/server.js') ||
      key.includes('\\src\\skills\\') ||
      key.includes('/src/skills/')
    ) {
      delete require.cache[key];
    }
  });
  process.env.PORT = String(PORT);
  app = require('../../server.js');
  server = app.listen(PORT, HOST, done);
});

after(function () {
  if (server) {
    server.close();
  }
});

// ==================== 发布商品 ====================

describe('POST /api/products', function () {
  var token;

  before(function (_, done) {
    registerAndLogin('sellera@test.com', '13955550001', 'sellera123', '卖家A').then(function (t) {
      token = t;
      done();
    }).catch(done);
  });

  it('全部字段填写返回201', async function () {
    var res = await request(
      'POST',
      '/products',
      {
        title: '测试商品-全新iPhone',
        description: '几乎全新，配件齐全',
        category: '电子产品',
        price: 3000,
        originalPrice: 5999,
        condition: 9,
        images: ['/pics/iphone1.jpg'],
      },
      authHeaders(token)
    );
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.product);
    assert.strictEqual(res.body.product.title, '测试商品-全新iPhone');
    assert.strictEqual(res.body.product.price, 3000);
    assert.strictEqual(res.body.product.category, '电子产品');
  });

  it('未登录（无token）返回401', async function () {
    var res = await request('POST', '/products', {
      title: '未登录商品',
      description: '测试',
      category: '书籍',
      price: 10,
    });
    assert.strictEqual(res.status, 401);
  });

  it('缺少必填字段（title）返回400', async function () {
    var res = await request(
      'POST',
      '/products',
      {
        description: '缺少标题',
        category: '书籍',
        price: 10,
      },
      authHeaders(token)
    );
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('必填'));
  });
});

// ==================== 获取商品列表 ====================

describe('GET /api/products', function () {
  it('默认分页返回200，含products、total、page、limit', async function () {
    var res = await request('GET', '/products');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.products));
    assert.strictEqual(typeof res.body.total, 'number');
    assert.strictEqual(typeof res.body.page, 'number');
    assert.strictEqual(typeof res.body.limit, 'number');
    // 默认只返回 active 状态的商品（种子数据5个active商品）
    assert.ok(res.body.total >= 5);
  });

  it('search搜索返回匹配结果', async function () {
    var res = await request('GET', '/products?search=Python');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.total >= 1);
    var found = res.body.products.some(function (p) {
      return (
        p.title.toLowerCase().includes('python') ||
        p.description.toLowerCase().includes('python')
      );
    });
    assert.ok(found, '应找到包含Python的商品');
  });

  it('category筛选返回匹配结果', async function () {
    var res = await request('GET', '/products?category=书籍');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.total >= 2);
    res.body.products.forEach(function (p) {
      assert.strictEqual(p.category, '书籍');
    });
  });

  it('priceOrder=asc升序排列正确', async function () {
    var res = await request('GET', '/products?priceOrder=asc');
    assert.strictEqual(res.status, 200);
    var prices = res.body.products.map(function (p) {
      return p.price;
    });
    for (var i = 1; i < prices.length; i++) {
      assert.ok(prices[i] >= prices[i - 1], '价格应升序排列: ' + prices.join(','));
    }
  });

  it('priceOrder=desc降序排列正确', async function () {
    var res = await request('GET', '/products?priceOrder=desc');
    assert.strictEqual(res.status, 200);
    var prices = res.body.products.map(function (p) {
      return p.price;
    });
    for (var i = 1; i < prices.length; i++) {
      assert.ok(prices[i] <= prices[i - 1], '价格应降序排列: ' + prices.join(','));
    }
  });
});

// ==================== 获取商品详情 ====================

describe('GET /api/products/:id', function () {
  it('存在返回200，含product对象', async function () {
    // 种子数据中 ID=1 为"高等数学教材第七版"
    var res = await request('GET', '/products/1');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.product);
    assert.strictEqual(res.body.product.id, 1);
    assert.strictEqual(res.body.product.title, '高等数学教材第七版');
    assert.ok(Array.isArray(res.body.comments));
  });

  it('不存在返回404', async function () {
    var res = await request('GET', '/products/99999');
    assert.strictEqual(res.status, 404);
    assert.ok(res.body.message.includes('不存在') || res.body.message.includes('已删除'));
  });
});

// ==================== 编辑商品 ====================

describe('PUT /api/products/:id', function () {
  var tokenA, tokenB, productIdA;

  before(function (_, done) {
    registerAndLogin('editorA@test.com', '13966660001', 'editora123', '编辑卖家A')
      .then(function (t) {
        tokenA = t;
        return registerAndLogin('editorB@test.com', '13966660002', 'editorb123', '编辑卖家B');
      })
      .then(function (t) {
        tokenB = t;
        // A 发布商品
        return request(
          'POST',
          '/products',
          {
            title: 'A的商品-可编辑',
            description: '测试编辑权限',
            category: '生活用品',
            price: 50,
          },
          authHeaders(tokenA)
        );
      })
      .then(function (createRes) {
        productIdA = createRes.body.product.id;
        done();
      })
      .catch(done);
  });

  it('本人商品可编辑返回200', async function () {
    var res = await request(
      'PUT',
      '/products/' + productIdA,
      {
        title: 'A的商品-已修改',
        price: 60,
      },
      authHeaders(tokenA)
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.product.title, 'A的商品-已修改');
    assert.strictEqual(res.body.product.price, 60);
  });

  it('非本人商品返回403', async function () {
    var res = await request(
      'PUT',
      '/products/' + productIdA,
      {
        title: 'B试图修改',
      },
      authHeaders(tokenB)
    );
    assert.strictEqual(res.status, 403);
    assert.ok(res.body.message.includes('无权'));
  });
});

// ==================== 删除商品 ====================

describe('DELETE /api/products/:id', function () {
  var tokenA, tokenB, productIdA;

  before(function (_, done) {
    registerAndLogin('deleterA@test.com', '13977770001', 'deletera123', '删除卖家A')
      .then(function (t) {
        tokenA = t;
        return registerAndLogin('deleterB@test.com', '13977770002', 'deleterb123', '删除卖家B');
      })
      .then(function (t) {
        tokenB = t;
        return request(
          'POST',
          '/products',
          {
            title: '待删除商品',
            description: '将被卖家A删除',
            category: '其他',
            price: 1,
          },
          authHeaders(tokenA)
        );
      })
      .then(function (createRes) {
        productIdA = createRes.body.product.id;
        done();
      })
      .catch(done);
  });

  it('本人商品可删除返回200', async function () {
    var res = await request('DELETE', '/products/' + productIdA, null, authHeaders(tokenA));
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('已删除'));
  });

  it('删除后状态变为 deleted', async function () {
    var res = await request('GET', '/products/' + productIdA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.product.status, 'deleted');
  });

  it('非本人商品返回403', async function () {
    // B 尝试删除种子数据中属于其他用户的商品（ID=1，sellerId=2）
    var res = await request('DELETE', '/products/1', null, authHeaders(tokenB));
    assert.strictEqual(res.status, 403);
    assert.ok(res.body.message.includes('无权'));
  });
});

// ==================== 我的发布 ====================

describe('我的发布 GET /api/products?mine=true', function () {
  var tokenMine;

  before(function (_, done) {
    registerAndLogin('mineuser@test.com', '13988880001', 'mineuser123', '我的发布测试')
      .then(function (t) {
        tokenMine = t;
        // 该用户发布2个商品
        return request(
          'POST',
          '/products',
          {
            title: '我的商品1',
            description: '仅我可见-1',
            category: '书籍',
            price: 20,
          },
          authHeaders(tokenMine)
        );
      })
      .then(function () {
        return request(
          'POST',
          '/products',
          {
            title: '我的商品2',
            description: '仅我可见-2',
            category: '电子产品',
            price: 100,
          },
          authHeaders(tokenMine)
        );
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  it('仅返回当前用户发布的商品', async function () {
    var res = await request('GET', '/products?mine=true', null, authHeaders(tokenMine));
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.total >= 2, '至少应返回2个该用户的商品');
    res.body.products.forEach(function (p) {
      assert.ok(
        p.title === '我的商品1' || p.title === '我的商品2',
        '应只包含当前用户的商品，但发现: ' + p.title
      );
    });
  });

  it('不包含其他用户的商品', async function () {
    var res = await request('GET', '/products?mine=true', null, authHeaders(tokenMine));
    assert.strictEqual(res.status, 200);
    var hasOther = res.body.products.some(function (p) {
      return p.sellerNickname !== '我的发布测试';
    });
    assert.strictEqual(hasOther, false, '不应包含其他用户的商品');
  });
});
