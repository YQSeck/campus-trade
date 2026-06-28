// 【模块七：CLI】用户封禁/解封命令
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const chalk = require('chalk');
const apiClient = require('../apiClient');

function register(cmd) {
  // trade-cli users ban <userId>
  cmd.command('ban <userId>')
    .description('灏佺鐢ㄦ埛锛堥渶绠＄悊鍛?Token锛?)
    .option('-r, --reason <reason>', '灏佺鍘熷洜')
    .action(function(userId, opts) {
      apiClient.put('/users/' + userId + '/ban', { reason: opts.reason || '绠＄悊鍛樻搷浣? })
        .then(function(res) {
          console.log(chalk.green('鉁?' + res.data.message));
          console.log('  鐢ㄦ埛ID: ' + res.data.userId);
          console.log('  鐢ㄦ埛鍚? ' + res.data.nickname);
        })
        .catch(function(err) {
          handleError(err);
        });
    });

  // trade-cli users unban <userId>
  cmd.command('unban <userId>')
    .description('瑙ｅ皝鐢ㄦ埛锛堥渶绠＄悊鍛?Token锛?)
    .action(function(userId) {
      apiClient.put('/users/' + userId + '/unban')
        .then(function(res) {
          console.log(chalk.green('鉁?' + res.data.message));
          console.log('  鐢ㄦ埛ID: ' + res.data.userId);
          console.log('  鐢ㄦ埛鍚? ' + res.data.nickname);
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
