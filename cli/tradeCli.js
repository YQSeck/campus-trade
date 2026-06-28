// 【模块七：CLI】命令行工具入口
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const { Command } = require('commander');
const apiClient = require('./apiClient');
const productsCmd = require('./commands/products');
const ordersCmd = require('./commands/orders');
const usersCmd = require('./commands/users');
const chalk = require('chalk');

var program = new Command();

program
  .name('trade-cli')
  .description('CampusTrade 绠＄悊鍛樺懡浠よ宸ュ叿')
  .version('1.0.0')
  .option('-t, --token <token>', '璁剧疆 JWT Token锛堜紭鍏堢骇楂樹簬鐜鍙橀噺锛?)
  .hook('preAction', function(thisCommand) {
    var opts = thisCommand.opts();
    if (opts.token) {
      apiClient.setToken(opts.token);
    }
  });

// 瀛愬懡浠わ細鍟嗗搧绠＄悊
var productsCommand = program
  .command('products')
  .description('鍟嗗搧鍒楄〃涓庢悳绱?);

productsCmd.register(productsCommand);

// 瀛愬懡浠わ細璁㈠崟鎶ヨ〃
var ordersCommand = program
  .command('orders')
  .description('璁㈠崟鎶ヨ〃瀵煎嚭');

ordersCmd.register(ordersCommand);

// 瀛愬懡浠わ細鐢ㄦ埛绠＄悊
var usersCommand = program
  .command('users')
  .description('鐢ㄦ埛灏佺涓庤В灏?);

usersCmd.register(usersCommand);

// 瀛愬懡浠わ細蹇€熺粺璁?program
  .command('stats')
  .description('鏌ョ湅骞冲彴鏁版嵁缁熻锛堥渶绠＄悊鍛?Token锛?)
  .action(function() {
    apiClient.get('/admin/stats')
      .then(function(res) {
        var s = res.data;
        console.log(chalk.bold('\nCampusTrade 骞冲彴缁熻'));
        console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣');
        console.log(' 鍟嗗搧鎬绘暟:  ' + chalk.yellow(s.totalProducts));
        console.log(' 璁㈠崟鎬绘暟:  ' + chalk.yellow(s.totalOrders));
        console.log(' 鐢ㄦ埛鎬绘暟:  ' + chalk.yellow(s.totalUsers));
        console.log(' 杩戜竴鍛ㄨ鍗?' + chalk.yellow(s.recentOrders));
        console.log('鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣鈹佲攣\n');
      })
      .catch(function(err) {
        handleError(err);
      });
  });

function handleError(err) {
  if (err.response) {
    console.error(chalk.red('閿欒 [' + err.response.status + ']: ' + (err.response.data.message || JSON.stringify(err.response.data))));
  } else if (err.code === 'ECONNREFUSED') {
    console.error(chalk.red('鏃犳硶杩炴帴鍒板悗绔湇鍔″櫒銆傝纭 server.js 宸插惎鍔細npm run server'));
  } else {
    console.error(chalk.red('閿欒: ' + err.message));
  }
  process.exit(1);
}

program.parse(process.argv);
