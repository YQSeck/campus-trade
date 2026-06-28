// 【模块八：开放 Skill】定价 API 测试
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
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
  it('鏈夋晥杈撳叆(鍥涘弬鏁?杩斿洖 200 + success:true', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '鐢靛瓙浜у搧',
      condition: '杞诲井浣跨敤',
      originalPrice: 4399,
      marketPrices: [1800, 2100, 1950, 2200]
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.suggestedPrice > 0);
    assert.strictEqual(res.body.confidence, 0.85);
  });

  it('浠呮湁鍒嗙被+鎴愯壊杩斿洖 200 + success:true', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.suggestedPrice > 0);
  });

  it('鏃犳晥鍒嗙被杩斿洖 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '姹借溅',
      condition: '鍑犱箮鍏ㄦ柊'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.indexOf('鏃犳晥鍒嗙被') !== -1);
  });

  it('鏃犳晥鎴愯壊杩斿洖 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {
      category: '涔︾睄',
      condition: '鐮寸儌'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.indexOf('鏃犳晥鎴愯壊') !== -1);
  });

  it('绌?body 杩斿洖 success:false', async function() {
    var res = await request('POST', '/skills/recommend', {});
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, false);
  });
});

describe('pricingApi - GET /api/skills/recommend/meta', function() {
  it('杩斿洖 categories 鍒楄〃', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.categories, ['涔︾睄', '鐢靛瓙浜у搧', '鐢熸椿鐢ㄥ搧', '琛ｇ墿', '鍏朵粬']);
  });

  it('杩斿洖 conditions 鍒楄〃', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.conditions, ['鍏ㄦ柊', '鍑犱箮鍏ㄦ柊', '杞诲井浣跨敤', '鏄庢樉浣跨敤', '鑰佹棫']);
  });

  it('杩斿洖 baseRates 鍚纭姌鎵ｇ巼', async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.baseRates['涔︾睄'], 0.45);
    assert.strictEqual(res.body.baseRates['鐢靛瓙浜у搧'], 0.55);
  });

  it('杩斿洖 conditionFactors 鍚纭洜瀛?, async function() {
    var res = await request('GET', '/skills/recommend/meta');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.conditionFactors['鍏ㄦ柊'], 0.95);
    assert.strictEqual(res.body.conditionFactors['鑰佹棫'], 0.25);
  });
});
