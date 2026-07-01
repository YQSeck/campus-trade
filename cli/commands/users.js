// AI 生成，手动调整：匹配新 admin 端点、var → const/let

const chalk = require('chalk');
const apiClient = require('../apiClient');

function register(cmd) {
  cmd
    .command('ban <userId>')
    .description('封禁用户（需管理员 Token）')
    .option('-d, --duration <duration>', '封禁天数')
    .option('-r, --reason <reason>', '封禁原因')
    .action(function (userId, opts) {
      apiClient
        .put('/admin/users/' + userId + '/ban', { reason: opts.reason || '管理员操作' })
        .then(function (res) {
          console.log(chalk.green('✔ ' + res.data.message));
          console.log('  用户ID: ' + res.data.userId);
          console.log('  用户名: ' + res.data.nickname);
        })
        .catch(function (err) {
          handleError(err);
        });
    });

  cmd
    .command('unban <userId>')
    .description('解封用户（需管理员 Token）')
    .action(function (userId) {
      apiClient
        .put('/admin/users/' + userId + '/unban')
        .then(function (res) {
          console.log(chalk.green('✔ ' + res.data.message));
          console.log('  用户ID: ' + res.data.userId);
          console.log('  用户名: ' + res.data.nickname);
        })
        .catch(function (err) {
          handleError(err);
        });
    });
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
