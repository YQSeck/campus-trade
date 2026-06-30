// 【模块八：开放 Skill】定价数据单元测试
// AI 生成：手动调整前请勿修改
var { describe, it } = require('node:test');
var assert = require('node:assert/strict');
var pricingData = require('../../src/skills/pricingData');

describe('pricingData - 数据常量', function() {
  it('validCategories 包含 5 个分类', function() {
    assert.deepStrictEqual(pricingData.validCategories, ['书籍', '电子产品', '生活用品', '衣物', '其他']);
  });

  it('validConditions 包含 5 个成色等级', function() {
    assert.deepStrictEqual(pricingData.validConditions, ['全新', '几乎全新', '轻微使用', '明显使用', '老旧']);
  });

  it('categoryBaseRates 所有值在 [0, 1] 范围内', function() {
    Object.values(pricingData.categoryBaseRates).forEach(function(rate) {
      assert.ok(rate > 0 && rate < 1);
    });
  });

  it('conditionFactors 所有值在 [0, 1] 范围内', function() {
    Object.values(pricingData.conditionFactors).forEach(function(factor) {
      assert.ok(factor > 0 && factor < 1);
    });
  });
});

describe('pricingData - getCategoryBaseRate', function() {
  it('已知分类返回正确折扣率', function() {
    assert.strictEqual(pricingData.getCategoryBaseRate('书籍'), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate('电子产品'), 0.55);
    assert.strictEqual(pricingData.getCategoryBaseRate('生活用品'), 0.40);
    assert.strictEqual(pricingData.getCategoryBaseRate('衣物'), 0.35);
    assert.strictEqual(pricingData.getCategoryBaseRate('其他'), 0.45);
  });

  it('未知分类回退到"其他"(0.45)', function() {
    assert.strictEqual(pricingData.getCategoryBaseRate('汽车'), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate('食品'), 0.45);
  });

  it('未定义/空值分类回退到"其他"', function() {
    assert.strictEqual(pricingData.getCategoryBaseRate(null), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate(undefined), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate(''), 0.45);
  });
});

describe('pricingData - getConditionFactor', function() {
  it('已知成色返回正确折旧因子', function() {
    assert.strictEqual(pricingData.getConditionFactor('全新'), 0.95);
    assert.strictEqual(pricingData.getConditionFactor('几乎全新'), 0.80);
    assert.strictEqual(pricingData.getConditionFactor('轻微使用'), 0.60);
    assert.strictEqual(pricingData.getConditionFactor('明显使用'), 0.40);
    assert.strictEqual(pricingData.getConditionFactor('老旧'), 0.25);
  });

  it('未知成色回退到 0.50', function() {
    assert.strictEqual(pricingData.getConditionFactor('破烂'), 0.50);
    assert.strictEqual(pricingData.getConditionFactor('报废'), 0.50);
  });

  it('未定义/空值成色回退到 0.50', function() {
    assert.strictEqual(pricingData.getConditionFactor(null), 0.50);
    assert.strictEqual(pricingData.getConditionFactor(undefined), 0.50);
    assert.strictEqual(pricingData.getConditionFactor(''), 0.50);
  });
});

describe('pricingData - isValidCategory', function() {
  it('有效分类返回 true', function() {
    assert.strictEqual(pricingData.isValidCategory('书籍'), true);
    assert.strictEqual(pricingData.isValidCategory('电子产品'), true);
    assert.strictEqual(pricingData.isValidCategory('生活用品'), true);
    assert.strictEqual(pricingData.isValidCategory('衣物'), true);
    assert.strictEqual(pricingData.isValidCategory('其他'), true);
  });

  it('无效分类返回 false', function() {
    assert.strictEqual(pricingData.isValidCategory('汽车'), false);
    assert.strictEqual(pricingData.isValidCategory('食品'), false);
    assert.strictEqual(pricingData.isValidCategory(''), false);
    assert.strictEqual(pricingData.isValidCategory(null), false);
    assert.strictEqual(pricingData.isValidCategory(undefined), false);
  });
});

describe('pricingData - isValidCondition', function() {
  it('有效成色返回 true', function() {
    assert.strictEqual(pricingData.isValidCondition('全新'), true);
    assert.strictEqual(pricingData.isValidCondition('几乎全新'), true);
    assert.strictEqual(pricingData.isValidCondition('轻微使用'), true);
    assert.strictEqual(pricingData.isValidCondition('明显使用'), true);
    assert.strictEqual(pricingData.isValidCondition('老旧'), true);
  });

  it('无效成色返回 false', function() {
    assert.strictEqual(pricingData.isValidCondition('破烂'), false);
    assert.strictEqual(pricingData.isValidCondition(''), false);
    assert.strictEqual(pricingData.isValidCondition(null), false);
    assert.strictEqual(pricingData.isValidCondition(undefined), false);
  });
});

describe('pricingData - 5 分类 x 5 成色全覆盖', function() {
  var categories = pricingData.validCategories;
  var conditions = pricingData.validConditions;

  categories.forEach(function(category) {
    conditions.forEach(function(condition) {
      it(category + ' + ' + condition + ' 返回数值', function() {
        var rate = pricingData.getCategoryBaseRate(category);
        var factor = pricingData.getConditionFactor(condition);
        assert.ok(typeof rate === 'number');
        assert.ok(typeof factor === 'number');
        assert.ok(rate >= 0.25 && rate <= 0.95);
        assert.ok(factor >= 0.25 && factor <= 0.95);
      });
    });
  });
});
