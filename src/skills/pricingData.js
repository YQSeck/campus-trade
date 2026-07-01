var categoryBaseRates = {
  书籍: 0.45,
  电子产品: 0.55,
  生活用品: 0.4,
  衣物: 0.35,
  其他: 0.45,
};

var conditionFactors = {
  全新: 0.95,
  几乎全新: 0.8,
  轻微使用: 0.6,
  明显使用: 0.4,
  老旧: 0.25,
};

var categoryDescriptions = {
  书籍: '教材、参考书折旧较快，除非是热门专业书',
  电子产品: '随换代折价明显，残值取决于品牌和配置',
  生活用品: '实用性商品，折旧取决于外观磨损程度',
  衣物: '二手服饰折价最高，除非为品牌款',
  其他: '按一般二手折旧率估算',
};

var validCategories = Object.keys(categoryBaseRates);
var validConditions = Object.keys(conditionFactors);

function getCategoryBaseRate(category) {
  return categoryBaseRates[category] || categoryBaseRates['其他'];
}

function getConditionFactor(condition) {
  return conditionFactors[condition] || 0.5;
}

function isValidCategory(category) {
  return validCategories.indexOf(category) !== -1;
}

function isValidCondition(condition) {
  return validConditions.indexOf(condition) !== -1;
}

module.exports = {
  categoryBaseRates,
  conditionFactors,
  categoryDescriptions,
  validCategories,
  validConditions,
  getCategoryBaseRate,
  getConditionFactor,
  isValidCategory,
  isValidCondition,
};
