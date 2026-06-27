// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var { describe, it, before, after, beforeEach } = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');
var os = require('os');

// apiClient 鍦?require 鏃朵細璇诲彇 TRADE_TOKEN 鍜?config 鏂囦欢
// 娴嬭瘯闇€瑕侀殧绂荤幆澧?
var originalToken = process.env.TRADE_TOKEN;
var originalApiUrl = process.env.TRADE_API_URL;
var configFile = path.join(os.homedir(), '.trade-cli', 'config.json');

function cleanConfig() {
  try { fs.unlinkSync(configFile); } catch (_) {}
}

beforeEach(function() {
  cleanConfig();
  delete process.env.TRADE_TOKEN;
  delete require.cache[require.resolve('../../cli/apiClient')];
});

after(function() {
  cleanConfig();
  if (originalToken) {
    process.env.TRADE_TOKEN = originalToken;
  } else {
    delete process.env.TRADE_TOKEN;
  }
  if (originalApiUrl) {
    process.env.TRADE_API_URL = originalApiUrl;
  } else {
    delete process.env.TRADE_API_URL;
  }
  cleanConfig();
});

describe('apiClient - baseURL', function() {
  it('榛樿 baseURL 涓?http://localhost:3000/api', function() {
    delete process.env.TRADE_API_URL;
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.baseURL, 'http://localhost:3000/api');
    delete require.cache[require.resolve('../../cli/apiClient')];
  });

  it('閫氳繃 TRADE_API_URL 鐜鍙橀噺鍙鐩?baseURL', function() {
    process.env.TRADE_API_URL = 'http://custom:8080/api';
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.baseURL, 'http://custom:8080/api');
    delete process.env.TRADE_API_URL;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});

describe('apiClient - token 鍔犺浇', function() {
  it('浠?TRADE_TOKEN 鐜鍙橀噺鍔犺浇 token', function() {
    delete require.cache[require.resolve('../../cli/apiClient')];
    process.env.TRADE_TOKEN = 'test-env-jwt-token';
    var client = require('../../cli/apiClient');
    var testConfig = { headers: {} };
    var result = client.interceptors.request.handlers[0].fulfilled(testConfig);
    assert.strictEqual(result.headers.Authorization, 'Bearer test-env-jwt-token');
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });

  it('绌?token 涓嶉檮鍔?Authorization 澶?, function() {
    delete process.env.TRADE_TOKEN;
    process.env.TRADE_TOKEN = '';
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    client.setToken = function() {}; // 閬垮厤鍐欏叆鏂囦欢
    var testConfig = { headers: {} };
    var result = client.interceptors.request.handlers[0].fulfilled(testConfig);
    assert.strictEqual(result.headers.Authorization, undefined);
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});

describe('apiClient - setToken', function() {
  it('setToken 鍚庤姹傚ご鍖呭惈鏂?token', function() {
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    client.setToken('new-test-token');
    var testConfig = { headers: {} };
    var result = client.interceptors.request.handlers[0].fulfilled(testConfig);
    assert.strictEqual(result.headers.Authorization, 'Bearer new-test-token');
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});

describe('apiClient - 瓒呮椂閰嶇疆', function() {
  it('榛樿瓒呮椂涓?15000ms', function() {
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.timeout, 15000);
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});
