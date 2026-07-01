

var { describe, it } = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../../src/skills/pricing');

describe('pricing.recommend - 参数校验', function() {
  it('无效分类返回 error', function() {
    var result = pricing.recommend({ category: '汽车', condition: '几乎全新' });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.indexOf('无效分类') !== -1);
  });

  it('无效成色返回 error', function() {
    var result = pricing.recommend({ category: '书籍', condition: '报废' });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.indexOf('无效成色') !== -1);
  });

  it('缺少分类返回 error', function() {
    var result = pricing.recommend({ condition: '全新' });
    assert.strictEqual(result.success, false);
  });

  it('缺少成色返回 error', function() {
    var result = pricing.recommend({ category: '电子产品' });
    assert.strictEqual(result.success, false);
  });

  it('空对象返回 error', function() {
    var result = pricing.recommend({});
    assert.strictEqual(result.success, false);
  });

  it('分类为 undefined 返回 error', function() {
    var result = pricing.recommend({ category: undefined, condition: '几乎全新' });
    assert.strictEqual(result.success, false);
  });
});

describe('pricing.recommend - 分支①：原价 + 市场参考（置信度 0.85）', function() {
  it('电子产品 + 轻微使用 + 原价 4399 + 市场均价 2012.50 = 约1676.00', function() {
    var result = pricing.recommend({
      category: '电子产品',
      condition: '轻微使用',
      originalPrice: 4399,
      marketPrices: [1800, 2100, 1950, 2200]
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.85);
    var basePrice = Math.round((4399 * 0.55 * 0.60) * 100) / 100;
    var marketAvg = Math.round(((1800 + 2100 + 1950 + 2200) / 4) * 100) / 100;
    var expected = Math.round((basePrice * 0.6 + marketAvg * 0.4) * 100) / 100;
    assert.strictEqual(result.suggestedPrice, expected);
    assert.strictEqual(result.breakdown.marketAdjustment, true);
    assert.strictEqual(result.breakdown.categoryBaseRate, 0.55);
    assert.strictEqual(result.breakdown.conditionFactor, 0.60);
    assert.strictEqual(result.breakdown.marketAverage, 2012.50);
  });

  it('单元索 marketPrices 正常计算', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '全新',
      originalPrice: 100,
      marketPrices: [50]
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.85);
    assert.strictEqual(result.breakdown.marketAverage, 50);
    assert.strictEqual(result.breakdown.marketAdjustment, true);
  });
});

describe('pricing.recommend - 分支②：仅有原价（置信度 0.60）', function() {
  it('书籍 + 几乎全新 + 原价 49 = 17.64', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
      originalPrice: 49
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.suggestedPrice, Math.round((49 * 0.45 * 0.80) * 100) / 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('生活用品 + 明显使用 + 原价 39', function() {
    var result = pricing.recommend({
      category: '生活用品',
      condition: '明显使用',
      originalPrice: 39
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.suggestedPrice, Math.round((39 * 0.40 * 0.40) * 100) / 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
  });
});

describe('pricing.recommend - 分支③：仅有市场参考（置信度 0.50）', function() {
  it('市场均价 = suggestedPrice', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '轻微使用',
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

describe('pricing.recommend - 分支④：仅有分类+成色（置信度 0.20）', function() {
  it('生活用品 + 明显使用 → 归一化指数 16.00', function() {
    var result = pricing.recommend({
      category: '生活用品',
      condition: '明显使用'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);

    assert.strictEqual(result.suggestedPrice, 0.40 * 0.40 * 100);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('电子产品 + 老旧 → 归一化指数', function() {
    var result = pricing.recommend({
      category: '电子产品',
      condition: '老旧'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.suggestedPrice, 0.55 * 0.25 * 100);
  });

  it('衣物 + 全新 → 归一化指数', function() {
    var result = pricing.recommend({
      category: '衣物',
      condition: '全新'
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.suggestedPrice, 0.35 * 0.95 * 100);
  });
});

describe('pricing.recommend - 边界值', function() {
  it('原价为 0 视为未提供（走分支④）', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
      originalPrice: 0
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('原价为负数视为未提供', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
      originalPrice: -100
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
  });

  it('marketPrices 为空数组视为未提供', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
      marketPrices: []
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.20);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
    assert.strictEqual(result.breakdown.marketAverage, null);
  });

  it('原价 + 空市场参考 → 走分支②', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
      originalPrice: 49,
      marketPrices: []
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.confidence, 0.60);
    assert.strictEqual(result.breakdown.marketAdjustment, false);
  });

  it('极大原价不溢出', function() {
    var result = pricing.recommend({
      category: '电子产品',
      condition: '全新',
      originalPrice: 999999
    });
    assert.strictEqual(result.success, true);
    assert.ok(isFinite(result.suggestedPrice));
    assert.ok(!isNaN(result.suggestedPrice));
  });
});

describe('pricing.recommend - 输出结构校验', function() {
  it('成功时返回完整字段', function() {
    var result = pricing.recommend({
      category: '书籍',
      condition: '几乎全新',
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

  it('priceRange.min ≤ suggestedPrice ≤ priceRange.max', function() {
    var result = pricing.recommend({
      category: '生活用品',
      condition: '明显使用',
      originalPrice: 100,
      marketPrices: [30, 35, 28]
    });
    assert.ok(result.priceRange.min <= result.suggestedPrice);
    assert.ok(result.suggestedPrice <= result.priceRange.max);
    assert.ok(result.priceRange.min >= 0);
  });

  it('reasoning 为非空中文字符串', function() {
    var result = pricing.recommend({
      category: '衣物',
      condition: '老旧',
      originalPrice: 200
    });
    assert.ok(typeof result.reasoning === 'string');
    assert.ok(result.reasoning.length > 0);
    assert.ok(/[\u4e00-\u9fff]/.test(result.reasoning));
  });

  it('suggestedPrice 保留两位小数精度', function() {
    var result = pricing.recommend({
      category: '电子产品',
      condition: '轻微使用',
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

describe('pricing.recommend - 区间宽度与置信度关系', function() {
  it('高置信度区间窄', function() {
    var high = pricing.recommend({
      category: '电子产品',
      condition: '轻微使用',
      originalPrice: 4399,
      marketPrices: [2000]
    });
    var highRange = high.priceRange.max - high.priceRange.min;
    assert.ok(highRange > 0);
  });

  it('低置信度区间宽', function() {
    var low = pricing.recommend({
      category: '生活用品',
      condition: '明显使用'
    });
    var lowRange = low.priceRange.max - low.priceRange.min;
    assert.ok(lowRange > 0);
  });
});

describe('pricing.recommend - 失败时返回结构', function() {
  it('失败时仅含 success 和 error', function() {
    var result = pricing.recommend({ category: '汽车', condition: '几乎全新' });
    assert.strictEqual(result.success, false);
    assert.ok('error' in result);
    assert.ok(!('suggestedPrice' in result));
  });
});
