// 【模块七：CLI】HTTP 客户端与 Token 管理
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

// CLI 涓撶敤 HTTP 瀹㈡埛绔細鍔熻兘绛変环浜庢祻瑙堝櫒绔?@/utils/request.js
// 鍖哄埆锛歵oken 浼樺厛浠庣幆澧冨彉閲?TRADE_TOKEN 璇诲彇锛屽叾娆′粠 ~/.trade-cli/config.json 璇诲彇
const BASE_URL = process.env.TRADE_API_URL || 'http://localhost:3000/api';

function loadToken() {
  if (process.env.TRADE_TOKEN) {
    return process.env.TRADE_TOKEN;
  }
  var configPath = path.join(os.homedir(), '.trade-cli', 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.token || '';
    }
  } catch (e) {
    // ignore
  }
  return '';
}

var token = loadToken();

var apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

apiClient.interceptors.request.use(function(config) {
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

apiClient.setToken = function(t) {
  token = t;
  if (process.env.TRADE_TOKEN) {
    process.env.TRADE_TOKEN = t;
  }
  var configDir = path.join(os.homedir(), '.trade-cli');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({ token: t }, null, 2));
};

module.exports = apiClient;
