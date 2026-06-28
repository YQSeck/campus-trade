// 【模块八：开放 Skill】定价数据单元测试
// AI 生成：手动调整前请勿修改
// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var { describe, it } = require('node:test');
var assert = require('node:assert/strict');
var pricingData = require('../../src/skills/pricingData');

describe('pricingData - 鏁版嵁甯搁噺', function() {
  it('validCategories 鍖呭惈 5 涓垎绫?, function() {
    assert.deepStrictEqual(pricingData.validCategories, ['涔︾睄', '鐢靛瓙浜у搧', '鐢熸椿鐢ㄥ搧', '琛ｇ墿', '鍏朵粬']);
  });

  it('validConditions 鍖呭惈 5 涓垚鑹茬瓑绾?, function() {
    assert.deepStrictEqual(pricingData.validConditions, ['鍏ㄦ柊', '鍑犱箮鍏ㄦ柊', '杞诲井浣跨敤', '鏄庢樉浣跨敤', '鑰佹棫']);
  });

  it('categoryBaseRates 鎵€鏈夊€煎湪 [0, 1] 鑼冨洿鍐?, function() {
    Object.values(pricingData.categoryBaseRates).forEach(function(rate) {
      assert.ok(rate > 0 && rate < 1);
    });
  });

  it('conditionFactors 鎵€鏈夊€煎湪 [0, 1] 鑼冨洿鍐?, function() {
    Object.values(pricingData.conditionFactors).forEach(function(factor) {
      assert.ok(factor > 0 && factor < 1);
    });
  });
});

describe('pricingData - getCategoryBaseRate', function() {
  it('宸茬煡鍒嗙被杩斿洖姝ｇ‘鎶樻墸鐜?, function() {
    assert.strictEqual(pricingData.getCategoryBaseRate('涔︾睄'), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate('鐢靛瓙浜у搧'), 0.55);
    assert.strictEqual(pricingData.getCategoryBaseRate('鐢熸椿鐢ㄥ搧'), 0.40);
    assert.strictEqual(pricingData.getCategoryBaseRate('琛ｇ墿'), 0.35);
    assert.strictEqual(pricingData.getCategoryBaseRate('鍏朵粬'), 0.45);
  });

  it('鏈煡鍒嗙被鍥為€€鍒?鍏朵粬"(0.45)', function() {
    assert.strictEqual(pricingData.getCategoryBaseRate('姹借溅'), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate('椋熷搧'), 0.45);
  });

  it('鏈畾涔?绌哄€煎垎绫诲洖閫€鍒?鍏朵粬"', function() {
    assert.strictEqual(pricingData.getCategoryBaseRate(null), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate(undefined), 0.45);
    assert.strictEqual(pricingData.getCategoryBaseRate(''), 0.45);
  });
});

describe('pricingData - getConditionFactor', function() {
  it('宸茬煡鎴愯壊杩斿洖姝ｇ‘鎶樻棫鍥犲瓙', function() {
    assert.strictEqual(pricingData.getConditionFactor('鍏ㄦ柊'), 0.95);
    assert.strictEqual(pricingData.getConditionFactor('鍑犱箮鍏ㄦ柊'), 0.80);
    assert.strictEqual(pricingData.getConditionFactor('杞诲井浣跨敤'), 0.60);
    assert.strictEqual(pricingData.getConditionFactor('鏄庢樉浣跨敤'), 0.40);
    assert.strictEqual(pricingData.getConditionFactor('鑰佹棫'), 0.25);
  });

  it('鏈煡鎴愯壊鍥為€€鍒?0.50', function() {
    assert.strictEqual(pricingData.getConditionFactor('鐮寸儌'), 0.50);
    assert.strictEqual(pricingData.getConditionFactor('鎶ュ簾'), 0.50);
  });

  it('鏈畾涔?绌哄€兼垚鑹插洖閫€鍒?0.50', function() {
    assert.strictEqual(pricingData.getConditionFactor(null), 0.50);
    assert.strictEqual(pricingData.getConditionFactor(undefined), 0.50);
    assert.strictEqual(pricingData.getConditionFactor(''), 0.50);
  });
});

describe('pricingData - isValidCategory', function() {
  it('鏈夋晥鍒嗙被杩斿洖 true', function() {
    assert.strictEqual(pricingData.isValidCategory('涔︾睄'), true);
    assert.strictEqual(pricingData.isValidCategory('鐢靛瓙浜у搧'), true);
    assert.strictEqual(pricingData.isValidCategory('鐢熸椿鐢ㄥ搧'), true);
    assert.strictEqual(pricingData.isValidCategory('琛ｇ墿'), true);
    assert.strictEqual(pricingData.isValidCategory('鍏朵粬'), true);
  });

  it('鏃犳晥鍒嗙被杩斿洖 false', function() {
    assert.strictEqual(pricingData.isValidCategory('姹借溅'), false);
    assert.strictEqual(pricingData.isValidCategory('椋熷搧'), false);
    assert.strictEqual(pricingData.isValidCategory(''), false);
    assert.strictEqual(pricingData.isValidCategory(null), false);
    assert.strictEqual(pricingData.isValidCategory(undefined), false);
  });
});

describe('pricingData - isValidCondition', function() {
  it('鏈夋晥鎴愯壊杩斿洖 true', function() {
    assert.strictEqual(pricingData.isValidCondition('鍏ㄦ柊'), true);
    assert.strictEqual(pricingData.isValidCondition('鍑犱箮鍏ㄦ柊'), true);
    assert.strictEqual(pricingData.isValidCondition('杞诲井浣跨敤'), true);
    assert.strictEqual(pricingData.isValidCondition('鏄庢樉浣跨敤'), true);
    assert.strictEqual(pricingData.isValidCondition('鑰佹棫'), true);
  });

  it('鏃犳晥鎴愯壊杩斿洖 false', function() {
    assert.strictEqual(pricingData.isValidCondition('鐮寸儌'), false);
    assert.strictEqual(pricingData.isValidCondition(''), false);
    assert.strictEqual(pricingData.isValidCondition(null), false);
    assert.strictEqual(pricingData.isValidCondition(undefined), false);
  });
});

describe('pricingData - 5 鍒嗙被 x 5 鎴愯壊鍏ㄨ鐩?, function() {
  var categories = pricingData.validCategories;
  var conditions = pricingData.validConditions;

  categories.forEach(function(category) {
    conditions.forEach(function(condition) {
      it(category + ' + ' + condition + ' 杩斿洖鏁板€?, function() {
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
