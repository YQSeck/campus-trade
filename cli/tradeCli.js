// 【模块七：CLI】命令行工具入口
// AI 生成：手动调整前请勿修改
// AI 
const { Command } = require('commander');
const apiClient = require('./apiClient');
const productsCmd = require('./commands/products');
const ordersCmd = require('./commands/orders');
const usersCmd = require('./commands/users');
const chalk = require('chalk');

var program = new Command();

program
  .name('trade-cli')
  .description('CampusTrade 管理员命令行工具')
  .version('1.0.0')
  .option('-t, --token <token>', '设置 JWT Token（优先级高于环境变量）')
  .hook('preAction', function(thisCommand) {
    var opts = thisCommand.opts();
    if (opts.token) {
      apiClient.setToken(opts.token);
    }
  });

// 子命令：商品管理
var productsCommand = program
  .command('products')
  .description('商品列表与搜索');

productsCmd.register(productsCommand);

// 子命令：订单报表
var ordersCommand = program
  .command('orders')
  .description('订单报表导出');

ordersCmd.register(ordersCommand);

// 子命令：用户管理
var usersCommand = program
  .command('users')
  .description('用户封禁与解封');

usersCmd.register(usersCommand);

// 子命令：快速统计
program
  .command('stats')
  .description('查看平台数据统计（需管理员 Token）')
  .action(function() {
    apiClient.get('/admin/stats')
      .then(function(res) {
        var s = res.data;
        console.log(chalk.bold('\nCampusTrade 平台统计'));
        console.log('────────────────────────────────────────────────────────');
        console.log(' 商品总数:  ' + chalk.yellow(s.totalProducts));
        console.log(' 订单总数:  ' + chalk.yellow(s.totalOrders));
        console.log(' 用户总数:  ' + chalk.yellow(s.totalUsers));
        console.log('  近一周订单: ' + chalk.yellow(s.recentOrders));
        console.log('────────────────────────────────────────────────────────\n');
      })
      .catch(function(err) {
        handleError(err);
      });
  });

function handleError(err) {
  if (err.response) {
    console.error(chalk.red('错误 [' + err.response.status + ']: ' + (err.response.data.message || JSON.stringify(err.response.data))));
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('无法连接到后端服务器。请确认 server.js 已启动：npm run server'));
  } else {
    console.error(chalk.red('错误: ' + err.message));
  }
  process.exit(1);
}

program.parse(process.argv);
