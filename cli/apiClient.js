const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BASE_URL = process.env.TRADE_API_URL || 'http://localhost:3000/api';

function loadToken() {
  if (process.env.TRADE_TOKEN) {
    return process.env.TRADE_TOKEN;
  }
  const configPath = path.join(os.homedir(), '.trade-cli', 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.token || '';
    }
  } catch (e) {}
  return '';
}

let token = loadToken();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(function (config) {
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

apiClient.setToken = function (t) {
  token = t;
  if (process.env.TRADE_TOKEN) {
    process.env.TRADE_TOKEN = t;
  }
  const configDir = path.join(os.homedir(), '.trade-cli');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({ token: t }, null, 2));
};

module.exports = apiClient;
