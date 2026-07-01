

var { describe, it, before, after, beforeEach } = require('node:test');
var assert = require('node:assert/strict');
var fs = require('fs');
var path = require('path');
var os = require('os');

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
  it('默认 baseURL 为 http://localhost:3000/api', function() {
    delete process.env.TRADE_API_URL;
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.baseURL, 'http://localhost:3000/api');
    delete require.cache[require.resolve('../../cli/apiClient')];
  });

  it('通过 TRADE_API_URL 环境变量可覆盖 baseURL', function() {
    process.env.TRADE_API_URL = 'http://custom:8080/api';
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.baseURL, 'http://custom:8080/api');
    delete process.env.TRADE_API_URL;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});

describe('apiClient - token 加载', function() {
  it('从 TRADE_TOKEN 环境变量加载 token', function() {
    delete require.cache[require.resolve('../../cli/apiClient')];
    process.env.TRADE_TOKEN = 'test-env-jwt-token';
    var client = require('../../cli/apiClient');
    var testConfig = { headers: {} };
    var result = client.interceptors.request.handlers[0].fulfilled(testConfig);
    assert.strictEqual(result.headers.Authorization, 'Bearer test-env-jwt-token');
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });

  it('空 token 不附加 Authorization 头', function() {
    delete process.env.TRADE_TOKEN;
    process.env.TRADE_TOKEN = '';
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    client.setToken = function() {};
    var testConfig = { headers: {} };
    var result = client.interceptors.request.handlers[0].fulfilled(testConfig);
    assert.strictEqual(result.headers.Authorization, undefined);
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});

describe('apiClient - setToken', function() {
  it('setToken 后请求头包含新 token', function() {
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

describe('apiClient - 超时配置', function() {
  it('默认超时为 15000ms', function() {
    delete process.env.TRADE_TOKEN;
    delete require.cache[require.resolve('../../cli/apiClient')];
    var client = require('../../cli/apiClient');
    assert.strictEqual(client.defaults.timeout, 15000);
    delete require.cache[require.resolve('../../cli/apiClient')];
  });
});
