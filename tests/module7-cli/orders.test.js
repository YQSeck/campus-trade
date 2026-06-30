// 【模块七：CLI】订单导出单元测试
// AI 生成：手动调整前请勿修改
var { describe, it } = require('node:test');
var assert = require('node:assert/strict');

function escapeCsv(str) {
  if (!str) return '';
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function ordersToCsv(orders) {
  var headers = ['订单ID', '商品名称', '商品类别', '买家', '卖家', '状态', '金额', '创建时间'];
  var rows = orders.map(function(o) {
    var statusMap = { pending: '待付款', shipped: '待收货', completed: '已完成', cancelled: '已取消' };
    var statusLabel = statusMap[o.status] || o.status;
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
  return '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
}

describe('orders - escapeCsv', function() {
  it('无特殊字符原样返回', function() {
    assert.strictEqual(escapeCsv('正常标题'), '正常标题');
  });

  it('含逗号用双引号包裹', function() {
    assert.strictEqual(escapeCsv('标题,带逗号'), '"标题,带逗号"');
  });

  it('含双引号转义并包裹', function() {
    assert.strictEqual(escapeCsv('说"你好"'), '"说""你好"""');
  });

  it('空字符串返回空串', function() {
    assert.strictEqual(escapeCsv(''), '');
  });

  it('null/undefined 返回空串', function() {
    assert.strictEqual(escapeCsv(null), '');
    assert.strictEqual(escapeCsv(undefined), '');
  });

  it('纯数字不触发转义', function() {
    assert.strictEqual(escapeCsv('12345'), '12345');
  });
});

describe('orders - ordersToCsv', function() {
  it('空数组仅含表头', function() {
    var csv = ordersToCsv([]);
    var lines = csv.split('\n');
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].indexOf('订单ID') === 1); // after BOM
    assert.strictEqual(lines[1], '');
  });

  it('BOM 开头', function() {
    var csv = ordersToCsv([]);
    assert.strictEqual(csv.charCodeAt(0), 0xFEFF);
  });

  it('单条记录行数 = 表头 + 1', function() {
    var csv = ordersToCsv([{
      id: '1',
      productTitle: '测试商品',
      productCategory: '书籍',
      buyerName: '张三',
      sellerName: '李四',
      status: 'pending',
      price: 25,
      createdAt: '2026-06-26T08:00:00.000Z'
    }]);
    var lines = csv.split('\n').filter(function(l) { return l !== ''; });
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[1].indexOf('测试商品') !== -1);
  });

  it('多条记录行数正确', function() {
    var orders = [
      { id: '1', productTitle: 'A', productCategory: '书籍', buyerName: '张', sellerName: '李', status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', productTitle: 'B', productCategory: '电子产品', buyerName: '王', sellerName: '赵', status: 'completed', price: 20, createdAt: '2026-01-02T00:00:00.000Z' }
    ];
    var csv = ordersToCsv(orders);
    var lines = csv.split('\n').filter(function(l) { return l !== ''; });
    assert.strictEqual(lines.length, 3);
  });

  it('金额保留两位小数', function() {
    var csv = ordersToCsv([{
      id: '1', productTitle: 'A', productCategory: '书籍', buyerName: '张', sellerName: '李',
      status: 'pending', price: 25.5, createdAt: '2026-01-01T00:00:00.000Z'
    }]);
    assert.ok(csv.indexOf('25.50') !== -1);
  });

  it('状态中文映射正确', function() {
    var csv = ordersToCsv([
      { id: '1', productTitle: 'A', productCategory: '书籍', buyerName: '张', sellerName: '李', status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', productTitle: 'B', productCategory: '书籍', buyerName: '张', sellerName: '李', status: 'shipped', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '3', productTitle: 'C', productCategory: '书籍', buyerName: '张', sellerName: '李', status: 'completed', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '4', productTitle: 'D', productCategory: '书籍', buyerName: '张', sellerName: '李', status: 'cancelled', price: 10, createdAt: '2026-01-01T00:00:00.000Z' }
    ]);
    assert.ok(csv.indexOf('待付款') !== -1);
    assert.ok(csv.indexOf('待收货') !== -1);
    assert.ok(csv.indexOf('已完成') !== -1);
    assert.ok(csv.indexOf('已取消') !== -1);
  });

  it('含逗号的商品名被正确转义', function() {
    var csv = ordersToCsv([{
      id: '1', productTitle: '商品,A款', productCategory: '书籍', buyerName: '张', sellerName: '李',
      status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z'
    }]);
    assert.ok(csv.indexOf('"商品,A款"') !== -1);
  });
});
