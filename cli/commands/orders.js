// 【模块七：CLI】订单报表导出命令
// AI 生成：手动调整前请勿修改
// AI 
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const apiClient = require('../apiClient');

function register(cmd) {
  cmd.command('export')
    .description('导出订单报表（需管理员 Token）')
    .option('-f, --format <format>', '导出格式：csv 或 json（默认 csv）', 'csv')
    .option('-o, --output <file>', '输出文件路径（默认 orders_export.csv）', 'orders_export.csv')
    .option('-s, --status <status>', '按状态筛选（pending/shipped/completed/cancelled）')
    .action(function(opts) {
      var params = { page: 1, limit: 100 };
      if (opts.status) params.status = opts.status;

      apiClient.get('/orders', { params: params })
        .then(function(res) {
          var orders = res.data.orders;
          if (orders.length === 0) {
            console.log(chalk.yellow('没有符合条件的订单'));
            return;
          }

          var outputPath = path.resolve(opts.output);
          var content;
          if (opts.format === 'json') {
            content = JSON.stringify(orders, null, 2);
            if (!outputPath.endsWith('.json')) outputPath += '.json';
          } else {
            content = ordersToCsv(orders);
            if (!outputPath.endsWith('.csv')) outputPath += '.csv';
          }

          fs.writeFileSync(outputPath, content, 'utf8');
          console.log(chalk.green('✔ 报表已导出: ' + outputPath));
          console.log(chalk.gray('  共 ' + orders.length + ' 条订单'));

          // 简单统计摘要
          var statusCount = {};
          var totalAmount = 0;
          orders.forEach(function(o) {
            statusCount[o.status] = (statusCount[o.status] || 0) + 1;
            totalAmount += o.price;
          });
          console.log(chalk.bold('\n摘要'));
          Object.keys(statusCount).forEach(function(s) {
            var label = { pending: '待付款', shipped: '待收货', completed: '已完成', cancelled: '已取消' }[s] || s;
            console.log('  ' + label + ': ' + statusCount[s] + ' 笔');
          });
          console.log('  ' + '交易总额: 楼' + totalAmount.toFixed(2) + '\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });
}

function ordersToCsv(orders) {
  var headers = ['订单ID', '商品名称', '商品类目', '买家', '卖家', '状态', '金额', '创建时间'];
  var rows = orders.map(function(o) {
    var statusLabel = { pending: '待付款', shipped: '待收货', completed: '已完成', cancelled: '已取消' }[o.status] || o.status;
    return [
      o.id,
      escapeCsv(o.productTitle),
      o.productCategory,
      escapeCsv(o.buyerName),
      escapeCsv(o.sellerName),
      statusLabel,
      o.price.toFixed(2),
      o.createdAt
    ].join(',');
  });
  var csv = headers.join(',') + '\n' + rows.join('\n');
  // 添加 BOM 使 Excel 正确识别 UTF-8 中文
  return '\uFEFF' + csv;
}

function escapeCsv(str) {
  if (!str) return '';
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function handleError(err) {
  if (err.response) {
    console.error(chalk.red('错误 [' + err.response.status + ']: ' + (err.response.data.message || '')));
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('无法连接到后端服务器。请确认 server.js 已启动：npm run server'));
  } else {
    console.error(chalk.red('错误: ' + err.message));
  }
  process.exit(1);
}

module.exports = { register: register };
