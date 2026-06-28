// 【模块八：开放 Skill】定价引擎单元测试
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var { describe, it } = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../../src/skills/pricing');

describe('pricing.recommend - 鍙傛暟鏍￠獙', function() {
  it('鏃犳晥鍒嗙被杩斿洖 error', function() {
    var result = pricing.recommend({ category: '姹借溅', condition: '鍑犱箮鍏ㄦ柊' });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.indexOf('鏃犳晥鍒嗙被') !== -1);
  });

  it('鏃犳晥鎴愯壊杩斿洖 error', function() {
    var result = pricing.recommend({ category: '涔︾睄', condition: '鎶ュ簾' });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.indexOf('鏃犳晥鎴愯壊') !== -1);
  });

  it('缂哄皯鍒嗙被杩斿洖 error', function() {
    var result = pricing.recommend({ condition: '鍏ㄦ柊' });
    assert.strictEqual(result.success, false);
  });

  it('缂哄皯鎴愯壊杩斿洖 error', function() {
    var result = pricing.recommend({ category: '鐢靛瓙浜у搧' });
    assert.strictEqual(result.success, false);
  });

  it('绌哄璞¤繑鍥?error', function() {
    var result = pricing.recommend({});
    assert.strictEqual(result.success, false);
  });

  it('鍒嗙被涓?undefined 杩斿洖 error', function() {
    var result = pricing.recommend({ category: undefined, condition: '鍑犱箮鍏ㄦ柊' });
    assert.strictEqual(result.success, false);
  });
});

describe('pricing.recommend - 鍒嗘敮鈶狅細鍘熶环 + 甯傚満鍙傝€冿紙缃俊搴?0.85锛?, function() {
  it('鐢靛瓙浜у搧 + 杞诲井浣跨敤 + 鍘熶环 4399 + 甯傚満鍧囦环 2012.50 = 1932.71', function() {
    var result = pricing.recommend({
      category: '鐢靛瓙浜у搧',
      condition: '杞诲井浣跨敤',
      originalPrice: 4399,
      marketPrices: [1800, 2100, 1950, 2200]
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.85);
    // 璁＄畻锛歜asePrice = 4399 * 0.55 * 0.60 = 1451.67
    // marketAvg = (1800+2100+1950+2200)/4 = 2012.50
    // suggestedPrice = 1451.67 * 0.6 + 2012.50 * 0.4 = 871.002 + 805.00 = 1676.002
    // Round: Math.round(1676.002 * 100) / 100 = 1676.00
    var basePrice = Math.round((4399 * 0.55 * 0.60) * 100) / 100;
    var marketAvg = Math.round(((1800 + 2100 + 1950 + 2200) / 4) * 100) / 100;
    var expected = Math.round((basePrice * 0.6 + marketAvg * 0.4) * 100) / 100;
    assert.strictEqual(result.suggestedPrice, expected);
    assert.strictEqual(result.breakdown.marketAdjustment, true);
    assert.strictEqual(result.breakdown.categoryBaseRate, 0.55);
    assert.strictEqual(result.breakdown.conditionFactor, 0.60);
    assert.strictEqual(result.breakdown.marketAverage, 2012.50);
  });

  it('鍗曞厓绱?marketPrices 姝ｅ父璁＄畻', function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍏ㄦ柊',
      originalPrice: 100,
      marketPrices: [50]
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.85);
    assert.strictEqual(result.breakdown.marketAverage, 50);
    assert.strictEqual(result.breakdown.marketAdjustment, true);
  });
});

describe('pricing.recommend - 鍒嗘敮鈶★細浠呮湁鍘熶环锛堢疆淇″害 0.60锛?, function() {
  it('涔︾睄 + 鍑犱箮鍏ㄦ柊 + 鍘熶环 49 = 17.64', function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      originalPrice: 49
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.suggestedPrice, Math.round((49 * 0.45 * 0.80) * 100) / 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('鐢熸椿鐢ㄥ搧 + 鏄庢樉浣跨敤 + 鍘熶环 39', function() {
    var result = pricing.recommend({
      category: '鐢熸椿鐢ㄥ搧',
      condition: '鏄庢樉浣跨敤',
      originalPrice: 39
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.suggestedPrice, Math.round((39 * 0.40 * 0.40) * 100) / 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
  });
});

describe('pricing.recommend - 鍒嗘敮鈶細浠呮湁甯傚満鍙傝€冿紙缃俊搴?0.50锛?, function() {
  it('甯傚満鍧囦环 = suggestedPrice', function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '杞诲井浣跨敤',
      marketPrices: [30, 35, 28]
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.50);
    var expectedAvg = Math.round(((30 + 35 + 28) / 3) * 100) / 100;
    assert.strictEqual(result.suggestedPrice, expectedAvg);
    assert.strictEqual(result.breakdown.marketAdjustment, true);
    assert.strictEqual(result.breakdown.marketAverage, expectedAvg);
  });
});

describe('pricing.recommend - 鍒嗘敮鈶ｏ細浠呮湁鍒嗙被+鎴愯壊锛堢疆淇″害 0.20锛?, function() {
  it('鐢熸椿鐢ㄥ搧 + 鏄庢樉浣跨敤 鈫?褰掍竴鍖栨寚鏁?16.00', function() {
    var result = pricing.recommend({
      category: '鐢熸椿鐢ㄥ搧',
      condition: '鏄庢樉浣跨敤'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    // 0.40 * 0.40 * 100 = 16
    assert.strictEqual(result.suggestedPrice, 0.40 * 0.40 * 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('鐢靛瓙浜у搧 + 鑰佹棫 鈫?褰掍竴鍖栨寚鏁?, function() {
    var result = pricing.recommend({
      category: '鐢靛瓙浜у搧',
      condition: '鑰佹棫'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.suggestedPrice, 0.55 * 0.25 * 100);
  });

  it('琛ｇ墿 + 鍏ㄦ柊 鈫?褰掍竴鍖栨寚鏁?, function() {
    var result = pricing.recommend({
      category: '琛ｇ墿',
      condition: '鍏ㄦ柊'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.suggestedPrice, 0.35 * 0.95 * 100);
  });
});

describe('pricing.recommend - 杈圭晫鍊?, function() {
  it('鍘熶环涓?0 瑙嗕负鏈彁渚涳紙璧板垎鏀懀锛?, function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      originalPrice: 0
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('鍘熶环涓鸿礋鏁拌涓烘湭鎻愪緵', function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      originalPrice: -100
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
  });

  it('marketPrices 涓虹┖鏁扮粍瑙嗕负鏈彁渚?, function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      marketPrices: []
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('鍘熶环 + 绌哄競鍦哄弬鑰?鈫?璧板垎鏀憽', function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      originalPrice: 49,
      marketPrices: []
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
  });

  it('鏋佸ぇ鍘熶环涓嶆孩鍑?, function() {
    var result = pricing.recommend({
      category: '鐢靛瓙浜у搧',
      condition: '鍏ㄦ柊',
      originalPrice: 999999
    });
    assert.strictEqual(result.success, true);
    assert.ok(isFinite(result.suggestedPrice));
    assert.ok(!isNaN(result.suggestedPrice));
  });
});

describe('pricing.recommend - 杈撳嚭缁撴瀯鏍￠獙', function() {
  it('鎴愬姛鏃惰繑鍥炲畬鏁村瓧娈?, function() {
    var result = pricing.recommend({
      category: '涔︾睄',
      condition: '鍑犱箮鍏ㄦ柊',
      originalPrice: 100,
      marketPrices: [40, 50, 45]
    });
    assert.ok('success' in result);
    assert.ok('suggestedPrice' in result);
    assert.ok('priceRange' in result);
    assert.ok('confidence' in result);
    assert.ok('reasoning' in result);
    assert.ok('breakdown' in result);
    assert.ok('min' in result.priceRange);
    assert.ok('max' in result.priceRange);
    assert.ok('categoryBaseRate' in result.breakdown);
    assert.ok('conditionFactor' in result.breakdown);
    assert.ok('marketAverage' in result.breakdown);
    assert.ok('marketAdjustment' in result.breakdown);
  });

  it('priceRange.min 鈮?suggestedPrice 鈮?priceRange.max', function() {
    var result = pricing.recommend({
      category: '鐢熸椿鐢ㄥ搧',
      condition: '鏄庢樉浣跨敤',
      originalPrice: 100,
      marketPrices: [30, 35, 28]
    });
    assert.ok(result.priceRange.min <= result.suggestedPrice);
    assert.ok(result.suggestedPrice <= result.priceRange.max);
    assert.ok(result.priceRange.min >= 0);
  });

  it('reasoning 涓洪潪绌轰腑鏂囧瓧绗︿覆', function() {
    var result = pricing.recommend({
      category: '琛ｇ墿',
      condition: '鑰佹棫',
      originalPrice: 200
    });
    assert.ok(typeof result.reasoning === 'string');
    assert.ok(result.reasoning.length > 0);
    assert.ok(/[\u4e00-\u9fff]/.test(result.reasoning));
  });

  it('suggestedPrice 淇濈暀涓や綅灏忔暟绮惧害', function() {
    var result = pricing.recommend({
      category: '鐢靛瓙浜у搧',
      condition: '杞诲井浣跨敤',
      originalPrice: 4399,
      marketPrices: [1800, 2100, 1950, 2200]
    });
    var str = result.suggestedPrice.toString();
    var parts = str.split('.');
    if (parts.length > 1) {
      assert.ok(parts[1].length <= 2);
    }
  });
});

describe('pricing.recommend - 鍖洪棿瀹藉害涓庣疆淇″害鍏崇郴', function() {
  it('楂樼疆淇″害鍖洪棿绐?, function() {
    var high = pricing.recommend({
      category: '鐢靛瓙浜у搧',
      condition: '杞诲井浣跨敤',
      originalPrice: 4399,
      marketPrices: [2000]
    });
    var highRange = high.priceRange.max - high.priceRange.min;
    assert.ok(highRange > 0);
  });

  it('浣庣疆淇″害鍖洪棿瀹?, function() {
    var low = pricing.recommend({
      category: '鐢熸椿鐢ㄥ搧',
      condition: '鏄庢樉浣跨敤'
    });
    var lowRange = low.priceRange.max - low.priceRange.min;
    assert.ok(lowRange > 0);
  });
});

describe('pricing.recommend - 澶辫触鏃惰繑鍥炵粨鏋?, function() {
  it('澶辫触鏃朵粎鍚?success 鍜?error', function() {
    var result = pricing.recommend({ category: '姹借溅', condition: '鍑犱箮鍏ㄦ柊' });
    assert.strictEqual(result.success, false);
    assert.ok('error' in result);
    assert.ok(!('suggestedPrice' in result));
  });
});
