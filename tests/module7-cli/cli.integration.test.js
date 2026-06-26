// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var { describe, it, before, after } = require('node:test');
var assert = require('node:assert/strict');
var http = require('http');
var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');
var os = require('os');

var HOST = '127.0.0.1';
var PORT = 3098;
var app;
var server;
var adminToken;
var userToken;
var cliPath = path.join(__dirname, '..', '..', 'cli', 'tradeCli.js');

before(function(_, done) {
  process.env.PORT = String(PORT);
  delete process.env.TRADE_TOKEN;
  // 娓呯悊 ~/.trade-cli/config.json 閬垮厤 apiClient 娴嬭瘯鐨?token 娉勬紡
  try { fs.unlinkSync(path.join(os.homedir(), '.trade-cli', 'config.json')); } catch (_) {}
  delete require.cache[require.resolve('../../server.js')];
  app = require('../../server.js');
  server = app.listen(PORT, HOST, function() {
    loginAs('admin@campus.edu', 'admin123', function(err, token) {
      if (err) return done(err);
      adminToken = token;
      loginAs('user@campus.edu', 'user123', function(err, token) {
        if (err) return done(err);
        userToken = token;
        done();
      });
    });
  });
});

after(function() {
  if (server) {
    server.close();
  }
  // 娓呯悊鍙兘娈嬬暀鐨勫鍑烘枃浠?  try { fs.unlinkSync(path.join(__dirname, 'orders_export.csv')); } catch (_) {}
  try { fs.unlinkSync(path.join(__dirname, 'test_out.csv')); } catch (_) {}
  try { fs.unlinkSync(path.join(__dirname, 'test_out.json')); } catch (_) {}
});

function loginAs(email, password, cb) {
  var data = JSON.stringify({ email: email, password: password });
  var options = {
    hostname: HOST,
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  var req = http.request(options, function(res) {
    var chunks = [];
    res.on('data', function(c) { chunks.push(c); });
    res.on('end', function() {
      var body = JSON.parse(Buffer.concat(chunks).toString());
      cb(null, body.token);
    });
  });
  req.on('error', cb);
  req.write(data);
  req.end();
}

function runCli(args, opts) {
  opts = opts || {};
  return new Promise(function(resolve) {
    var fullArgs = [cliPath].concat(args);
    if (opts.token) {
      fullArgs.push('--token');
      fullArgs.push(opts.token);
    }
    var childEnv = Object.assign({}, process.env, opts.env || {}, {
      TRADE_API_URL: 'http://' + HOST + ':' + PORT + '/api'
    });
    delete childEnv.TRADE_TOKEN;
    // 骞惰 worker 闂?token 鍙兘閫氳繃 config 鏂囦欢娉勬紡锛岀‘淇濇棤 token 鏃舵竻鐞?    try { fs.unlinkSync(path.join(os.homedir(), '.trade-cli', 'config.json')); } catch (_) {}
    var child = childProcess.spawn('node', fullArgs, {
      cwd: __dirname,
      env: childEnv
    });
    var stdout = '';
    var stderr = '';
    child.stdout.on('data', function(d) { stdout += d.toString(); });
    child.stderr.on('data', function(d) { stderr += d.toString(); });
    child.on('close', function(code) {
      resolve({ code: code, stdout: stdout, stderr: stderr });
    });
  });
}

describe('CLI 闆嗘垚 - products list', function() {
  it('鏃犻渶 token锛屽垪鍑哄叏閮ㄥ晢鍝?, async function() {
    var result = await runCli(['products', 'list']);
    assert.ok(result.stdout.indexOf('鍟嗗搧鍒楄〃') !== -1);
    assert.ok(result.stdout.indexOf('楂樼瓑鏁板') !== -1);
    assert.ok(result.stdout.indexOf('iPad') !== -1);
  });

  it('鎸夊垎绫荤瓫閫?, async function() {
    var result = await runCli(['products', 'list', '-c', '涔︾睄']);
    assert.ok(result.stdout.indexOf('楂樼瓑鏁板') !== -1);
    assert.ok(result.stdout.indexOf('Python') !== -1);
    assert.ok(result.stdout.indexOf('iPad') === -1);
  });

  it('鍏抽敭璇嶆悳绱?, async function() {
    var result = await runCli(['products', 'search', 'Python']);
    assert.ok(result.stdout.indexOf('Python缂栫▼浠庡叆闂ㄥ埌瀹炶返') !== -1);
  });

  it('鏃犵粨鏋滄悳绱㈡樉绀烘彁绀?, async function() {
    var result = await runCli(['products', 'search', 'xyznotfound999']);
    assert.ok(result.stdout.indexOf('鏈壘鍒?) !== -1);
  });

  it('鍒嗛〉鍙傛暟鐢熸晥', async function() {
    var result = await runCli(['products', 'list', '-l', '2', '-p', '1']);
    assert.ok(result.stdout.indexOf('鎬昏 5 浠?) !== -1);
  });
});

describe('CLI 闆嗘垚 - orders export', function() {
  it('CSV 瀵煎嚭锛堢鐞嗗憳 token锛?, async function() {
    var outFile = path.join(__dirname, 'test_out.csv');
    var result = await runCli(['orders', 'export', '-o', outFile, '-f', 'csv'], { token: adminToken });
    assert.ok(result.stdout.indexOf('宸插鍑?) !== -1);
    assert.ok(fs.existsSync(outFile));
    var content = fs.readFileSync(outFile, 'utf8');
    assert.strictEqual(content.charCodeAt(0), 0xFEFF);
    assert.ok(content.indexOf('璁㈠崟ID') !== -1);
    fs.unlinkSync(outFile);
  });

  it('JSON 瀵煎嚭', async function() {
    var outFile = path.join(__dirname, 'test_out.json');
    var result = await runCli(['orders', 'export', '-o', outFile, '-f', 'json'], { token: adminToken });
    assert.ok(result.stdout.indexOf('宸插鍑?) !== -1);
    assert.ok(fs.existsSync(outFile));
    var data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok('productTitle' in data[0]);
    fs.unlinkSync(outFile);
  });

  it('鎸夌姸鎬佺瓫閫?, async function() {
    var outFile = path.join(__dirname, 'test_out.csv');
    await runCli(['orders', 'export', '-o', outFile, '-s', 'completed'], { token: adminToken });
    var content = fs.readFileSync(outFile, 'utf8');
    // 搴斿彧鍖呭惈 completed 璁㈠崟
    assert.ok(content.indexOf('宸插畬鎴?) !== -1);
    assert.ok(content.indexOf('寰呬粯娆?) === -1);
    assert.ok(content.indexOf('寰呮敹璐?) === -1);
    assert.ok(content.indexOf('宸插彇娑?) === -1);
    fs.unlinkSync(outFile);
  });

  it('鏃?token 搴旀姤 401', async function() {
    var outFile = path.join(__dirname, 'test_out.csv');
    var result = await runCli(['orders', 'export', '-o', outFile]);
    assert.ok(result.stderr.indexOf('401') !== -1 || result.stderr.indexOf('璁よ瘉') !== -1 || result.code !== 0);
  });
});

describe('CLI 闆嗘垚 - stats', function() {
  it('绠＄悊鍛?token 鏌ョ湅缁熻', async function() {
    var result = await runCli(['stats'], { token: adminToken });
    assert.ok(result.stdout.indexOf('鍟嗗搧鎬绘暟') !== -1);
    assert.ok(result.stdout.indexOf('璁㈠崟鎬绘暟') !== -1);
    assert.ok(result.stdout.indexOf('鐢ㄦ埛鎬绘暟') !== -1);
  });

  it('鏃?token 鎶ラ敊', async function() {
    var result = await runCli(['stats']);
    assert.ok(result.code !== 0);
  });
});

describe('CLI 闆嗘垚 - users ban/unban', function() {
  it('绠＄悊鍛樺皝绂佹櫘閫氱敤鎴?, async function() {
    var result = await runCli(['users', 'ban', '3'], { token: adminToken });
    assert.ok(result.stdout.indexOf('宸插皝绂?) !== -1);
    assert.ok(result.stdout.indexOf('鏉庡洓') !== -1);
  });

  it('绠＄悊鍛樿В灏佺敤鎴?, async function() {
    var result = await runCli(['users', 'unban', '3'], { token: adminToken });
    assert.ok(result.stdout.indexOf('宸茶В灏?) !== -1);
  });

  it('涓嶈兘灏佺绠＄悊鍛樿处鍙?, async function() {
    var result = await runCli(['users', 'ban', '1'], { token: adminToken });
    assert.ok(result.stderr.indexOf('涓嶈兘灏佺绠＄悊鍛?) !== -1 || result.code !== 0);
  });

  it('灏佺涓嶅瓨鍦ㄧ敤鎴疯繑鍥?404', async function() {
    var result = await runCli(['users', 'ban', '999'], { token: adminToken });
    assert.ok(result.stderr.indexOf('涓嶅瓨鍦?) !== -1 || result.stderr.indexOf('404') !== -1 || result.code !== 0);
  });

  it('鏃?token 灏佺鎶?401', async function() {
    var result = await runCli(['users', 'ban', '3']);
    assert.ok(result.code !== 0);
  });

  it('鏅€氱敤鎴?token 灏佺鎶?403', async function() {
    var result = await runCli(['users', 'ban', '3'], { token: userToken });
    assert.ok(result.stderr.indexOf('403') !== -1 || result.stderr.indexOf('鏉冮檺') !== -1 || result.code !== 0);
  });
});

describe('CLI 闆嗘垚 - 鐗堟湰淇℃伅', function() {
  it('--version 杈撳嚭鐗堟湰鍙?, async function() {
    var result = await runCli(['--version']);
    assert.ok(result.stdout.indexOf('1.0.0') !== -1);
  });
});
