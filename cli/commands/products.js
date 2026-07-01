// 【模块七：CLI】商品列表与搜索命令
// AI 生成：手动调整前请勿修改
// AI 
const chalk = require('chalk');
const apiClient = require('../apiClient');

function register(cmd) {
  // trade-cli products list
  cmd.command('list')
    .description('列出商品（分页、搜索、筛选）')
    .option('-p, --page <number>', '页码（默认 1）', '1')
    .option('-l, --limit <number>', '每页数量（默认 10）', '10')
    .option('-s, --search <keyword>', '关键词搜索')
    .option('-c, --category <category>', '按分类筛选（书籍/电子产品/生活用品/衣物/其他）')
    .action(function(opts) {
      var params = { page: parseInt(opts.page), limit: parseInt(opts.limit) };
      if (opts.search) params.search = opts.search;
      if (opts.category) params.category = opts.category;

      apiClient.get('/products', { params: params })
        .then(function(res) {
          var data = res.data;
          if (data.products.length === 0) {
            console.log(chalk.yellow('未找到商品'));
            return;
          }
          console.log(chalk.bold('\n商品列表（第 ' + data.page + ' 页 / 共 ' + Math.ceil(data.total / data.limit) + ' 页，总计 ' + data.total + ' 件）'));
          console.log('────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────');
          data.products.forEach(function(p) {
            console.log(
              chalk.blue('[' + p.id + ']') +
              ' ' + chalk.bold(p.title) +
              '  ' + chalk.green('楼' + p.price) +
              '  原价 楼' + p.originalPrice +
              '  ' + chalk.gray(p.category) +
              '  ' + chalk.gray(p.condition)
            );
          });
          console.log('────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });

  // trade-cli products search <keyword>
  cmd.command('search <keyword>')
    .description('按关键词搜索商品（标题/描述）')
    .action(function(keyword) {
      apiClient.get('/products', { params: { search: keyword, page: 1, limit: 20 } })
        .then(function(res) {
          var data = res.data;
          if (data.products.length === 0) {
            console.log(chalk.yellow('未找到包含 "' + keyword + '" 的商品'));
            return;
          }
          console.log(chalk.bold('\n搜索 "' + keyword + '" 结果（共 ' + data.total + ' 件）'));
          console.log('────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────');
          data.products.forEach(function(p) {
            console.log(
              chalk.blue('[' + p.id + ']') +
              ' ' + chalk.bold(p.title) +
              '  ' + chalk.green('楼' + p.price) +
              '  ' + chalk.gray(p.category)
            );
          });
          console.log('────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────\n');
        })
        .catch(function(err) {
          handleError(err);
        });
    });
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
