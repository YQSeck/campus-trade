// AI 生成，手动调整：添加 config 命令、stats --period、var → const/let

const { Command } = require('commander');
const apiClient = require('./apiClient');
const productsCmd = require('./commands/products');
const ordersCmd = require('./commands/orders');
const usersCmd = require('./commands/users');
const chalk = require('chalk');

const program = new Command();

program
  .name('trade-cli')
  .description('CampusTrade 管理员命令行工具')
  .version('1.0.0')
  .option('-t, --token <token>', '设置 JWT Token（优先级高于环境变量）')
  .hook('preAction', function (thisCommand) {
    const opts = thisCommand.opts();
    if (opts.token) {
      apiClient.setToken(opts.token);
    }
  });

const productsCommand = program.command('products').description('商品列表与搜索');

productsCmd.register(productsCommand);

const ordersCommand = program.command('orders').description('订单报表导出');

ordersCmd.register(ordersCommand);

const usersCommand = program.command('users').description('用户封禁与解封');

usersCmd.register(usersCommand);

program
  .command('stats')
  .description('查看平台数据统计（需管理员 Token）')
  .option('-p, --period <period>', '统计周期 day/week/month（默认 day）', 'day')
  .action(function (opts) {
    apiClient
      .get('/admin/stats')
      .then(function (res) {
        const s = res.data;
        console.log(chalk.bold('\nCampusTrade 平台统计'));
        console.log('────────────────────────────────────────────────────────────────');
        console.log(' 商品总数:  ' + chalk.yellow(s.productCount));
        console.log(' 订单总数:  ' + chalk.yellow(s.orderCount));
        console.log(' 用户总数:  ' + chalk.yellow(s.userCount));
        console.log(' 近一周交易额: ' + chalk.yellow(s.weeklyVolume));
        if (opts.period === 'week' || opts.period === 'month') {
          console.log(chalk.bold('\n日交易额趋势'));
          s.dailyVolume.forEach(function (d) {
            console.log('  ' + d.date + ': ' + chalk.yellow(d.volume));
          });
        }
        console.log('────────────────────────────────────────────────────────────────\n');
      })
      .catch(function (err) {
        handleError(err);
      });
  });

program
  .command('config')
  .description('配置 API 地址和 Token')
  .option('--api <url>', '设置 API 地址')
  .option('--token <token>', '设置管理员 Token')
  .action(function (opts) {
    if (opts.api) {
      process.env.TRADE_API_URL = opts.api;
      console.log(chalk.green('✔ API 地址已设置为: ' + opts.api));
    }
    if (opts.token) {
      apiClient.setToken(opts.token);
      console.log(chalk.green('✔ Token 已保存'));
    }
    if (!opts.api && !opts.token) {
      console.log(chalk.yellow('当前配置:'));
      console.log('  API: ' + process.env.TRADE_API_URL);
      console.log('  Token: ' + apiClient.defaults.headers.Authorization || '未设置');
    }
  });

function handleError(err) {
  if (err.response) {
    console.error(
      chalk.red(
        '错误 [' +
          err.response.status +
          ']: ' +
          (err.response.data.message || JSON.stringify(err.response.data))
      )
    );
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('无法连接到后端服务器。请确认 server.js 已启动：npm run server'));
  } else {
    console.error(chalk.red('错误: ' + err.message));
  }
  process.exit(1);
}

program.parse(process.argv);
