// 【模块七：CLI】商品列表与搜索命令
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const chalk = require('chalk');
const apiClient = require('../apiClient');

function register(cmd) {
  // trade-cli products list
  cmd.command('list')
    .description('鍒楀嚭鍟嗗搧锛堝垎椤点€佹悳绱€佺瓫閫夛級')
    .option('-p, --page <number>', '椤电爜锛堥粯璁?1锛?, '1')
    .option('-l, --limit <number>', '姣忛〉鏁伴噺锛堥粯璁?10锛?, '10')
    .option('-s, --search <keyword>', '鍏抽敭璇嶆悳绱?)
    .option('-c, --category <category>', '鎸夊垎绫荤瓫閫夛紙涔︾睄/鐢靛瓙浜у搧/鐢熸椿鐢ㄥ搧/琛ｇ墿/鍏朵粬锛?)
    .action(function(opts) {
      var params = { page: parseInt(opts.page), limit: parseInt(opts.limit) };
      if (opts.search) params.search = opts.search;
      if (opts.category) params.category = opts.category;

      apiClient.get('/products', { params: params })
        .then(function(res) {
          var data = res.data;
          if (data.products.length === 0) {
            console.log(chalk.yellow('鏈壘鍒板晢鍝?));
            return;
          }
          console.log(chalk.bold('\n鍟嗗搧鍒楄〃锛堢 ' + data.page + ' 椤?/ 鍏?' + Math.ceil(data.total / data.limit) + ' 椤碉紝鎬昏 ' + data.total + ' 浠讹級'));
          console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣');
          data.products.forEach(function(p) {
            console.log(
              chalk.blue('[' + p.id + ']') +
              ' ' + chalk.bold(p.title) +
              '  ' + chalk.green('楼' + p.price) +
              '  鍘熶环 楼' + p.originalPrice +
              '  ' + chalk.gray(p.category) +
              '  ' + chalk.gray(p.condition)
            );
          });
          console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });

  // trade-cli products search <keyword>
  cmd.command('search <keyword>')
    .description('鎸夊叧閿瘝鎼滅储鍟嗗搧锛堟爣棰?鎻忚堪锛?)
    .action(function(keyword) {
      apiClient.get('/products', { params: { search: keyword, page: 1, limit: 20 } })
        .then(function(res) {
          var data = res.data;
          if (data.products.length === 0) {
            console.log(chalk.yellow('鏈壘鍒板寘鍚?"' + keyword + '" 鐨勫晢鍝?));
            return;
          }
          console.log(chalk.bold('\n鎼滅储 "' + keyword + '" 缁撴灉锛堝叡 ' + data.total + ' 浠讹級'));
          console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣');
          data.products.forEach(function(p) {
            console.log(
              chalk.blue('[' + p.id + ']') +
              ' ' + chalk.bold(p.title) +
              '  ' + chalk.green('楼' + p.price) +
              '  ' + chalk.gray(p.category)
            );
          });
          console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });
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
