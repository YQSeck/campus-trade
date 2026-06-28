// 【模块七：CLI】订单报表导出命令
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const apiClient = require('../apiClient');

function register(cmd) {
  cmd.command('export')
    .description('瀵煎嚭璁㈠崟鎶ヨ〃锛堥渶绠＄悊鍛?Token锛?)
    .option('-f, --format <format>', '瀵煎嚭鏍煎紡锛歝sv 鎴?json锛堥粯璁?csv锛?, 'csv')
    .option('-o, --output <file>', '杈撳嚭鏂囦欢璺緞锛堥粯璁?orders_export.csv锛?, 'orders_export.csv')
    .option('-s, --status <status>', '鎸夌姸鎬佺瓫閫夛紙pending/shipped/completed/cancelled锛?)
    .action(function(opts) {
      var params = { page: 1, limit: 100 };
      if (opts.status) params.status = opts.status;

      apiClient.get('/orders', { params: params })
        .then(function(res) {
          var orders = res.data.orders;
          if (orders.length === 0) {
            console.log(chalk.yellow('娌℃湁绗﹀悎鏉′欢鐨勮鍗?));
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
          console.log(chalk.green('鉁?鎶ヨ〃宸插鍑? ' + outputPath));
          console.log(chalk.gray('  鍏?' + orders.length + ' 鏉¤鍗?));

          // 绠€鍗曠粺璁℃憳瑕?          var statusCount = {};
          var totalAmount = 0;
          orders.forEach(function(o) {
            statusCount[o.status] = (statusCount[o.status] || 0) + 1;
            totalAmount += o.price;
          });
          console.log(chalk.bold('\n鎽樿'));
          Object.keys(statusCount).forEach(function(s) {
            var label = { pending: '寰呬粯娆?, shipped: '寰呮敹璐?, completed: '宸插畬鎴?, cancelled: '宸插彇娑? }[s] || s;
            console.log('  ' + label + ': ' + statusCount[s] + ' 绗?);
          });
          console.log('  ' + '浜ゆ槗鎬婚: 楼' + totalAmount.toFixed(2) + '\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });
}

function ordersToCsv(orders) {
  var headers = ['璁㈠崟ID', '鍟嗗搧鍚嶇О', '鍟嗗搧绫荤洰', '涔板', '鍗栧', '鐘舵€?, '閲戦', '鍒涘缓鏃堕棿'];
  var rows = orders.map(function(o) {
    var statusLabel = { pending: '寰呬粯娆?, shipped: '寰呮敹璐?, completed: '宸插畬鎴?, cancelled: '宸插彇娑? }[o.status] || o.status;
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
  // 娣诲姞 BOM 浣?Excel 姝ｇ‘璇嗗埆 UTF-8 涓枃
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
    console.error(chalk.red('閿欒 [' + err.response.status + ']: ' + (err.response.data.message || '')));
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('鏃犳硶杩炴帴鍒板悗绔湇鍔″櫒銆傝纭 server.js 宸插惎鍔細npm run server'));
  } else {
    console.error(chalk.red('閿欒: ' + err.message));
  }
  process.exit(1);
}

module.exports = { register: register };
