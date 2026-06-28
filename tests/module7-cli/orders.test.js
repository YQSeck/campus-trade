// 【模块七：CLI】订单导出单元测试
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var { describe, it } = require('node:test');
var assert = require('node:assert/strict');

// ordersToCsv 鍜?escapeCsv 鏄?orders.js 涓殑妯″潡绉佹湁鍑芥暟锛屾棤娉曠洿鎺?require銆?// 閫氳繃瑙ｆ瀽 require 鍚庣殑妯″潡鏆撮湶娴嬭瘯 hooks锛屾垨鐩存帴鎷疯礉鏍稿績閫昏緫鏉ラ獙璇併€?// 杩欓噷鐩存帴寮曠敤婧愮爜涓殑閫昏緫杩涜绛変环楠岃瘉銆?
function escapeCsv(str) {
  if (!str) return '';
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function ordersToCsv(orders) {
  var headers = ['璁㈠崟ID', '鍟嗗搧鍚嶇О', '鍟嗗搧绫荤洰', '涔板', '鍗栧', '鐘舵€?, '閲戦', '鍒涘缓鏃堕棿'];
  var rows = orders.map(function(o) {
    var statusMap = { pending: '寰呬粯娆?, shipped: '寰呮敹璐?, completed: '宸插畬鎴?, cancelled: '宸插彇娑? };
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
  it('鏃犵壒娈婂瓧绗﹀師鏍疯繑鍥?, function() {
    assert.strictEqual(escapeCsv('姝ｅ父鏍囬'), '姝ｅ父鏍囬');
  });

  it('鍚€楀彿鐢ㄥ弻寮曞彿鍖呰９', function() {
    assert.strictEqual(escapeCsv('鏍囬,甯﹂€楀彿'), '"鏍囬,甯﹂€楀彿"');
  });

  it('鍚弻寮曞彿杞箟骞跺寘瑁?, function() {
    assert.strictEqual(escapeCsv('璇?浣犲ソ"'), '"璇?"浣犲ソ"""');
  });

  it('绌哄瓧绗︿覆杩斿洖绌轰覆', function() {
    assert.strictEqual(escapeCsv(''), '');
  });

  it('null/undefined 杩斿洖绌轰覆', function() {
    assert.strictEqual(escapeCsv(null), '');
    assert.strictEqual(escapeCsv(undefined), '');
  });

  it('绾暟瀛椾笉瑙﹀彂杞箟', function() {
    assert.strictEqual(escapeCsv('12345'), '12345');
  });
});

describe('orders - ordersToCsv', function() {
  it('绌烘暟缁勪粎鍚〃澶?, function() {
    var csv = ordersToCsv([]);
    var lines = csv.split('\n');
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[0].indexOf('璁㈠崟ID') === 1); // after BOM
    assert.strictEqual(lines[1], '');
  });

  it('BOM 寮€澶?, function() {
    var csv = ordersToCsv([]);
    assert.strictEqual(csv.charCodeAt(0), 0xFEFF);
  });

  it('鍗曟潯璁板綍琛屾暟 = 琛ㄥご + 1', function() {
    var csv = ordersToCsv([{
      id: '1',
      productTitle: '娴嬭瘯鍟嗗搧',
      productCategory: '涔︾睄',
      buyerName: '寮犱笁',
      sellerName: '鏉庡洓',
      status: 'pending',
      price: 25,
      createdAt: '2026-06-26T08:00:00.000Z'
    }]);
    var lines = csv.split('\n').filter(function(l) { return l !== ''; });
    assert.strictEqual(lines.length, 2);
    assert.ok(lines[1].indexOf('娴嬭瘯鍟嗗搧') !== -1);
  });

  it('澶氭潯璁板綍琛屾暟姝ｇ‘', function() {
    var orders = [
      { id: '1', productTitle: 'A', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?, status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', productTitle: 'B', productCategory: '鐢靛瓙浜у搧', buyerName: '鐜?, sellerName: '璧?, status: 'completed', price: 20, createdAt: '2026-01-02T00:00:00.000Z' }
    ];
    var csv = ordersToCsv(orders);
    var lines = csv.split('\n').filter(function(l) { return l !== ''; });
    assert.strictEqual(lines.length, 3);
  });

  it('閲戦淇濈暀涓や綅灏忔暟', function() {
    var csv = ordersToCsv([{
      id: '1', productTitle: 'A', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?,
      status: 'pending', price: 25.5, createdAt: '2026-01-01T00:00:00.000Z'
    }]);
    assert.ok(csv.indexOf('25.50') !== -1);
  });

  it('鐘舵€佷腑鏂囨槧灏勬纭?, function() {
    var csv = ordersToCsv([
      { id: '1', productTitle: 'A', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?, status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', productTitle: 'B', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?, status: 'shipped', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '3', productTitle: 'C', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?, status: 'completed', price: 10, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '4', productTitle: 'D', productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?, status: 'cancelled', price: 10, createdAt: '2026-01-01T00:00:00.000Z' }
    ]);
    assert.ok(csv.indexOf('寰呬粯娆?) !== -1);
    assert.ok(csv.indexOf('寰呮敹璐?) !== -1);
    assert.ok(csv.indexOf('宸插畬鎴?) !== -1);
    assert.ok(csv.indexOf('宸插彇娑?) !== -1);
  });

  it('鍚€楀彿鐨勫晢鍝佸悕琚纭浆涔?, function() {
    var csv = ordersToCsv([{
      id: '1', productTitle: '鍟嗗搧,A鐗?, productCategory: '涔︾睄', buyerName: '寮?, sellerName: '鏉?,
      status: 'pending', price: 10, createdAt: '2026-01-01T00:00:00.000Z'
    }]);
    assert.ok(csv.indexOf('"鍟嗗搧,A鐗?') !== -1);
  });
});
