// 【模块一：用户系统】自动化测试
// AI 生成：手动调整前请勿修改
var { describe, it, before, after } = require('node:test');
var assert = require('node:assert/strict');
var http = require('http');

var PORT = 3098;
var HOST = '127.0.0.1';

var app;
var server;

// ---------- helpers ----------

function request(method, path, body, headers) {
  return new Promise(function (resolve, reject) {
    var data = body ? JSON.stringify(body) : null;
    var options = {
      hostname: HOST,
      port: PORT,
      path: '/api' + path,
      method: method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
    };
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    var req = http.request(options, function (res) {
      var chunks = [];
      res.on('data', function (c) {
        chunks.push(c);
      });
      res.on('end', function () {
        var text = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(text) });
        } catch (_) {
          resolve({ status: res.statusCode, body: text });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

function authHeaders(token) {
  return { Authorization: 'Bearer ' + token };
}

// ---------- lifecycle ----------

before(function (_, done) {
  // 清除所有 server 相关模块缓存，确保每次测试文件启动时 db 为全新状态
  Object.keys(require.cache).forEach(function (key) {
    if (
      key.includes('\\server\\') ||
      key.includes('/server/') ||
      key.includes('\\server.js') ||
      key.includes('/server.js') ||
      key.includes('\\src\\skills\\') ||
      key.includes('/src/skills/')
    ) {
      delete require.cache[key];
    }
  });
  process.env.PORT = String(PORT);
  app = require('../../server.js');
  server = app.listen(PORT, HOST, done);
});

after(function () {
  if (server) {
    server.close();
  }
});

// ==================== 注册 ====================

describe('POST /api/auth/register', function () {
  it('仅邮箱注册成功', async function () {
    var res = await request('POST', '/auth/register', {
      email: 'test1@campus.edu',
      password: 'test123456',
      nickname: '测试用户1',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message, '注册成功');
    assert.ok(res.body.userId);
  });

  it('仅手机号注册成功', async function () {
    var res = await request('POST', '/auth/register', {
      phone: '13900001111',
      password: 'test123456',
      nickname: '测试用户2',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message, '注册成功');
    assert.ok(res.body.userId);
  });

  it('邮箱+手机号同时填写注册成功', async function () {
    var res = await request('POST', '/auth/register', {
      email: 'test3@campus.edu',
      phone: '13900002222',
      password: 'test123456',
      nickname: '测试用户3',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.message, '注册成功');
    assert.ok(res.body.userId);
  });

  it('邮箱和手机号都不填返回400', async function () {
    var res = await request('POST', '/auth/register', {
      password: 'test123456',
      nickname: '测试',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('邮箱和手机号至少填写一项'));
  });

  it('密码少于6位返回400', async function () {
    var res = await request('POST', '/auth/register', {
      email: 'shortpw@campus.edu',
      password: '12345',
      nickname: '测试',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('密码长度不能少于6位'));
  });

  it('邮箱已被注册返回409', async function () {
    // 先注册
    await request('POST', '/auth/register', {
      email: 'duplicate@campus.edu',
      password: 'test123456',
      nickname: '重复',
      school: '测试大学',
    });
    // 再次注册同邮箱
    var res = await request('POST', '/auth/register', {
      email: 'duplicate@campus.edu',
      password: 'test123456',
      nickname: '重复2',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 409);
    assert.ok(res.body.message.includes('已被注册'));
  });

  it('手机号已被注册返回409', async function () {
    // 先注册
    await request('POST', '/auth/register', {
      phone: '13900003333',
      password: 'test123456',
      nickname: '手机重复',
      school: '测试大学',
    });
    // 再次注册同手机号
    var res = await request('POST', '/auth/register', {
      phone: '13900003333',
      password: 'test123456',
      nickname: '手机重复2',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 409);
    assert.ok(res.body.message.includes('已被注册'));
  });

  it('手机号格式错误返回400', async function () {
    var res = await request('POST', '/auth/register', {
      phone: '12345678901',
      password: 'test123456',
      nickname: '格式错误',
      school: '测试大学',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('手机号格式'));
  });
});

// ==================== 登录 ====================

describe('POST /api/auth/login', function () {
  // 注意：normalizeAccount 会去除连字符，所以邮箱不要包含 -
  var emailAccount = 'loginemail@test.com';
  var phoneAccount = '13911110001';
  var validPassword = 'login123456';

  before(function (_, done) {
    request('POST', '/auth/register', {
      email: emailAccount,
      phone: phoneAccount,
      password: validPassword,
      nickname: '登录测试',
      school: '测试大学',
    }).then(function () {
      done();
    }).catch(done);
  });

  it('邮箱登录成功，返回token和user对象', async function () {
    var res = await request('POST', '/auth/login', {
      email: emailAccount,
      password: validPassword,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.email, emailAccount);
    assert.strictEqual(res.body.user.role, 'user');
  });

  it('手机号登录成功', async function () {
    var res = await request('POST', '/auth/login', {
      email: phoneAccount,
      password: validPassword,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.phone, phoneAccount);
  });

  it('密码错误返回401', async function () {
    var res = await request('POST', '/auth/login', {
      email: emailAccount,
      password: 'wrongpassword',
    });
    assert.strictEqual(res.status, 401);
  });

  it('账号不存在返回401', async function () {
    var res = await request('POST', '/auth/login', {
      email: 'noexist@test.com',
      password: 'test123456',
    });
    assert.strictEqual(res.status, 401);
  });

  it("管理员登录后user.role为'admin'", async function () {
    var res = await request('POST', '/auth/login', {
      email: 'admin@campus.edu',
      password: 'admin123',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'admin');
  });
});

// ==================== 忘记密码 ====================

describe('POST /api/auth/forgot-password', function () {
  var forgotEmail = 'forgot@test.com';

  before(function (_, done) {
    request('POST', '/auth/register', {
      email: forgotEmail,
      password: 'forgot123456',
      nickname: '忘记密码',
      school: '测试大学',
    }).then(function () {
      done();
    }).catch(done);
  });

  it('已注册邮箱返回200（验证码发送成功）', async function () {
    var res = await request('POST', '/auth/forgot-password', {
      email: forgotEmail,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('验证码已发送'));
  });

  it('未注册邮箱返回404', async function () {
    var res = await request('POST', '/auth/forgot-password', {
      email: 'notexist@test.com',
    });
    assert.strictEqual(res.status, 404);
    assert.ok(res.body.message.includes('未注册'));
  });
});

// ==================== 重置密码 ====================

describe('POST /api/auth/reset-password', function () {
  var resetEmail = 'resettest@campus.edu';
  var oldPassword = 'oldpass123';
  var capturedCode = null;
  var originalLog;

  before(function (_, done) {
    originalLog = console.log;

    request('POST', '/auth/register', {
      email: resetEmail,
      password: oldPassword,
      nickname: '重置测试',
      school: '测试大学',
    }).then(function () {
      // 发送验证码并捕获
      console.log = function () {
        var msg = Array.prototype.join.call(arguments, ' ');
        var match = msg.match(/验证码: (\d{6})/);
        if (match) capturedCode = match[1];
        originalLog.apply(console, arguments);
      };
      return request('POST', '/auth/forgot-password', { email: resetEmail });
    }).then(function () {
      console.log = originalLog;
      done();
    }).catch(done);
  });

  it('正确验证码+新密码返回200', async function () {
    assert.ok(capturedCode, '应捕获到验证码');
    var res = await request('POST', '/auth/reset-password', {
      email: resetEmail,
      code: capturedCode,
      newPassword: 'newpass123456',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('密码重置成功'));
  });

  it('错误验证码返回400', async function () {
    // 先重新发送验证码（上一个测试已消耗了 capturedCode）
    await request('POST', '/auth/forgot-password', { email: resetEmail });
    var res = await request('POST', '/auth/reset-password', {
      email: resetEmail,
      code: '000000',
      newPassword: 'somepass123',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('验证码错误'));
  });

  it('过期验证码（未发送过）返回400', async function () {
    var res = await request('POST', '/auth/reset-password', {
      email: 'otheremail@test.com',
      code: '123456',
      newPassword: 'somepass123',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(
      res.body.message.includes('未发送验证码') || res.body.message.includes('验证码已失效')
    );
  });

  it('重置后用新密码可登录、旧密码无法登录', async function () {
    var newPass = 'resetnew999';
    var code;
    // 先发送新验证码
    console.log = function () {
      var msg = Array.prototype.join.call(arguments, ' ');
      var match = msg.match(/验证码: (\d{6})/);
      if (match) code = match[1];
      originalLog.apply(console, arguments);
    };
    await request('POST', '/auth/forgot-password', { email: resetEmail });
    console.log = originalLog;

    // 用新验证码重置
    await request('POST', '/auth/reset-password', {
      email: resetEmail,
      code: code,
      newPassword: newPass,
    });

    // 旧密码无法登录
    var oldLogin = await request('POST', '/auth/login', {
      email: resetEmail,
      password: oldPassword,
    });
    assert.strictEqual(oldLogin.status, 401);

    // 新密码可登录
    var newLogin = await request('POST', '/auth/login', {
      email: resetEmail,
      password: newPass,
    });
    assert.strictEqual(newLogin.status, 200);
    assert.ok(newLogin.body.token);
  });

  it('新密码少于6位返回400', async function () {
    var res = await request('POST', '/auth/reset-password', {
      email: resetEmail,
      code: capturedCode || '123456',
      newPassword: '12345',
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('不能少于6位'));
  });
});

// ==================== 个人信息 ====================

describe('GET /api/user/profile', function () {
  var profileEmail = 'profile@test.com';
  var profilePwd = 'profile123';
  var token;

  before(function (_, done) {
    request('POST', '/auth/register', {
      email: profileEmail,
      password: profilePwd,
      nickname: '个人信息',
      school: '测试大学',
    }).then(function () {
      return request('POST', '/auth/login', {
        email: profileEmail,
        password: profilePwd,
      });
    }).then(function (loginRes) {
      token = loginRes.body.token;
      done();
    }).catch(done);
  });

  it('已登录返回200', async function () {
    var res = await request('GET', '/user/profile', null, authHeaders(token));
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.email, profileEmail);
  });

  it('未登录（无token）返回401', async function () {
    var res = await request('GET', '/user/profile');
    assert.strictEqual(res.status, 401);
  });
});

// ==================== 修改密码 ====================

describe('PUT /api/user/password', function () {
  var cpEmail = 'chgpwd@test.com';
  var oldPwd = 'oldpwd123456';
  var newPwd = 'newpwd123456';
  var token;

  before(function (_, done) {
    request('POST', '/auth/register', {
      email: cpEmail,
      password: oldPwd,
      nickname: '改密测试',
      school: '测试大学',
    }).then(function () {
      return request('POST', '/auth/login', {
        email: cpEmail,
        password: oldPwd,
      });
    }).then(function (loginRes) {
      token = loginRes.body.token;
      done();
    }).catch(done);
  });

  it('正确旧密码+新密码返回200', async function () {
    var res = await request(
      'PUT',
      '/user/password',
      { oldPassword: oldPwd, newPassword: newPwd },
      authHeaders(token)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('密码修改成功'));
  });

  it('旧密码错误返回400', async function () {
    // 使用已失效的旧密码
    var res = await request(
      'PUT',
      '/user/password',
      { oldPassword: oldPwd, newPassword: 'another123' },
      authHeaders(token)
    );
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message.includes('密码错误'));
  });

  it('无token返回401', async function () {
    var res = await request('PUT', '/user/password', {
      oldPassword: oldPwd,
      newPassword: newPwd,
    });
    assert.strictEqual(res.status, 401);
  });

  it('修改后旧密码无法登录', async function () {
    // 使用新密码登录成功
    var newLogin = await request('POST', '/auth/login', {
      email: cpEmail,
      password: newPwd,
    });
    assert.strictEqual(newLogin.status, 200);
    assert.ok(newLogin.body.token);

    // 旧密码无法登录
    var oldLogin = await request('POST', '/auth/login', {
      email: cpEmail,
      password: oldPwd,
    });
    assert.strictEqual(oldLogin.status, 401);
  });
});

// ==================== 登录冻结 ====================
// 注意：此测试使用独立账号，放在最后执行，避免影响其他测试

describe('登录冻结（连续密码错误）', function () {
  // normalizeAccount 会去除连字符，所以邮箱不要包含 -
  var lockEmail = 'lockouttest@campus.edu';
  var correctPwd = 'correct123456';

  before(function (_, done) {
    request('POST', '/auth/register', {
      email: lockEmail,
      password: correctPwd,
      nickname: '冻结测试',
      school: '测试大学',
    }).then(function () {
      done();
    }).catch(done);
  });

  it('连续5次密码错误后返回403（账号冻结）', async function () {
    // 前4次错误密码 → 401
    for (var i = 0; i < 4; i++) {
      var r = await request('POST', '/auth/login', {
        email: lockEmail,
        password: 'wrongpass',
      });
      assert.strictEqual(r.status, 401, '第 ' + (i + 1) + ' 次错误应返回401');
    }
    // 第5次错误密码 → 403（触发冻结）
    var r5 = await request('POST', '/auth/login', {
      email: lockEmail,
      password: 'wrongpass',
    });
    assert.strictEqual(r5.status, 403, '第5次错误应返回403');
    assert.ok(r5.body.message.includes('锁定') || r5.body.message.includes('冻结'));
  });

  it('冻结后即使用正确密码也返回403', async function () {
    var r = await request('POST', '/auth/login', {
      email: lockEmail,
      password: correctPwd,
    });
    assert.strictEqual(r.status, 403);
    assert.ok(r.body.message.includes('锁定') || r.body.message.includes('冻结'));
  });
});
