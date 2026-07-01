

var { describe, it, before, after } = require('node:test');
var assert = require('node:assert/strict');
var http = require('http');

var HOST = '127.0.0.1';
var PORT = 3099;
var BASE = 'http://' + HOST + ':' + PORT;

var app;
var server;

before(function(_, done) {
  process.env.PORT = String(PORT);
  app = require('../../server.js');
  server = app.listen(PORT, HOST, function() {
    done();
  });
});

after(function() {
  if (server) {
    server.close();
  }
});

function request(method, path, body) {
  return new Promise(function(resolve, reject) {
    var data = body ? JSON.stringify(body) : null;
    var options = {
      hostname: HOST,
      port: PORT,
      path: '/api' + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    var req = http.request(options, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        var text = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(text) });
        } catch (_) {
          resolve({ status: res.statusCode, body: text });
        }
      });
    });
    req.on('error', reject);
    if (data) { req.write(data); }
    req.end();
  });
}

describe('pricingApi - POST /api/skills/recommend', function() {
  it('有效输入(四参数)返回 200 + success:true', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '电子产品',
      condition: '轻微使用',
      originalPrice: 4399,
      marketPrices: [1800, 2100, 1950, 2200]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.suggestedPrice > 0);
    assert.strictEqual(res.body.confidence, 0.85);
  });

  it('仅有分类+成色返回 200 + success:true', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '书籍',
      condition: '几乎全新'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.suggestedPrice > 0);
  });

  it('无效分类返回 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '汽车',
      condition: '几乎全新'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.indexOf('无效分类') !== -1);
  });

  it('无效成色返回 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '书籍',
      condition: '破烂'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.indexOf('无效成色') !== -1);
  });

  it('空 body 返回 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {});
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
  });
});

describe('pricingApi - GET /api/skills/recommend/meta', function() {
  it('返回 categories 列表', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.categories, ['书籍', '电子产品', '生活用品', '衣物', '其他']);
  });

  it('返回 conditions 列表', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.conditions, ['全新', '几乎全新', '轻微使用', '明显使用', '老旧']);
  });

  it('返回 baseRates 含正确折扣率', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.baseRates['书籍'], 0.45);
    assert.strictEqual(res.body.baseRates['电子产品'], 0.55);
  });

  it('返回 conditionFactors 含正确因子', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.conditionFactors['全新'], 0.95);
    assert.strictEqual(res.body.conditionFactors['老旧'], 0.25);
  });
});
