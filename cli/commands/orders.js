// AI 生成，手动调整：添加 --start/--end 过滤、修正 CSV 表头、var → const/let

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const apiClient = require('../apiClient');

function register(cmd) {
  cmd
    .command('export')
    .description('导出订单报表（需管理员 Token）')
    .option('-f, --format <format>', '导出格式：csv 或 json（默认 csv）', 'csv')
    .option('-o, --output <file>', '输出文件路径（默认 orders_export.csv）', 'orders_export.csv')
    .option('-s, --status <status>', '按状态筛选（pending/paid/shipped/received/cancelled）')
    .option('--start <date>', '起始日期 YYYY-MM-DD')
    .option('--end <date>', '结束日期 YYYY-MM-DD')
    .action(function (opts) {
      const params = { page: 1, limit: 100 };
      if (opts.status) params.status = opts.status;

      apiClient
        .get('/orders', { params: params })
        .then(function (res) {
          let orders = res.data.orders;
          if (orders.length === 0) {
            console.log(chalk.yellow('没有符合条件的订单'));
            return;
          }

          if (opts.start) {
            const startDate = new Date(opts.start);
            orders = orders.filter(function (o) {
              return new Date(o.createdAt) >= startDate;
            });
          }
          if (opts.end) {
            const endDate = new Date(opts.end);
            endDate.setDate(endDate.getDate() + 1);
            orders = orders.filter(function (o) {
              return new Date(o.createdAt) < endDate;
            });
          }

          if (orders.length === 0) {
            console.log(chalk.yellow('没有符合条件的订单'));
            return;
          }

          let outputPath = path.resolve(opts.output);
          let content;
          if (opts.format === 'json') {
            content = JSON.stringify(orders, null, 2);
            if (!outputPath.endsWith('.json')) outputPath += '.json';
          } else {
            content = ordersToCsv(orders);
            if (!outputPath.endsWith('.csv')) outputPath += '.csv';
          }

          fs.writeFileSync(outputPath, content, 'utf8');
          console.log(chalk.green('✓ 报表已导出: ' + outputPath));
          console.log(chalk.gray('  共 ' + orders.length + ' 条订单'));

          const statusCount = {};
          let totalAmount = 0;
          orders.forEach(function (o) {
            statusCount[o.status] = (statusCount[o.status] || 0) + 1;
            totalAmount += o.price;
          });
          const statusLabelMap = {
            pending: '待付款',
            paid: '待发货',
            shipped: '待收货',
            received: '已完成',
            completed: '已完成',
            cancelled: '已取消',
          };
          console.log(chalk.bold('\n摘要'));
          Object.keys(statusCount).forEach(function (s) {
            const label = statusLabelMap[s] || s;
            console.log('  ' + label + ': ' + statusCount[s] + ' 笔');
          });
          console.log('  交易总额: ¥' + totalAmount.toFixed(2) + '\n');
        })
        .catch(function (err) {
          handleError(err);
        });
    });
}

function ordersToCsv(orders) {
  const headers = [
    '订单ID',
    '商品名称',
    '商品类别',
    '买家ID',
    '卖家ID',
    '状态',
    '金额',
    '创建时间',
  ];
  const statusLabelMap = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    received: '已完成',
    completed: '已完成',
    cancelled: '已取消',
  };
  const rows = orders.map(function (o) {
    const statusLabel = statusLabelMap[o.status] || o.status;
    return [
      o.id,
      escapeCsv(o.productTitle),
      o.productCategory || '',
      o.buyerId,
      o.sellerId,
      statusLabel,
      o.price.toFixed(2),
      o.createdAt,
    ].join(',');
  });
  const csv = headers.join(',') + '\n' + rows.join('\n');

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
    console.error(
      chalk.red('错误 [' + err.response.status + ']: ' + (err.response.data.message || ''))
    );
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('无法连接到后端服务器。请确认 server.js 已启动：npm run server'));
  } else {
    console.error(chalk.red('错误: ' + err.message));
  }
  process.exit(1);
}

module.exports = { register: register };
