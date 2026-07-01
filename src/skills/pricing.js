var pricingData = require('./pricingData');

function recommend(input) {
  var category = input.category;
  var condition = input.condition;
  var originalPrice = input.originalPrice;
  var marketPrices = input.marketPrices;

  if (!category || !pricingData.isValidCategory(category)) {
    return errorResult('无效分类，可选值：' + pricingData.validCategories.join('、'));
  }
  if (!condition || !pricingData.isValidCondition(condition)) {
    return errorResult('无效成色，可选值：' + pricingData.validConditions.join('、'));
  }

  var categoryRate = pricingData.getCategoryBaseRate(category);
  var conditionFactor = pricingData.getConditionFactor(condition);

  var basePrice = null;
  if (originalPrice && originalPrice > 0) {
    basePrice = originalPrice * categoryRate * conditionFactor;
    basePrice = Math.round(basePrice * 100) / 100;
  }

  var marketAvg = null;
  if (marketPrices && marketPrices.length > 0) {
    var sum = marketPrices.reduce(function (a, b) {
      return a + b;
    }, 0);
    marketAvg = sum / marketPrices.length;
    marketAvg = Math.round(marketAvg * 100) / 100;
  }

  var suggestedPrice;
  var confidence;
  var priceRange;
  var reasoningParts = [];

  reasoningParts.push(
    category +
      '类二手基准折扣率约' +
      Math.round(categoryRate * 100) +
      '%（' +
      pricingData.categoryDescriptions[category] +
      '）'
  );
  reasoningParts.push(condition + '折旧因子为' + Math.round(conditionFactor * 100) + '%');

  if (basePrice !== null && marketAvg !== null) {
    suggestedPrice = Math.round((basePrice * 0.6 + marketAvg * 0.4) * 100) / 100;
    confidence = 0.85;
    reasoningParts.push(
      '结合原价计算（¥' +
        basePrice.toFixed(2) +
        '）与市场参考均价（¥' +
        marketAvg.toFixed(2) +
        '），按6:4加权'
    );
  } else if (basePrice !== null) {
    suggestedPrice = basePrice;
    confidence = 0.6;
    reasoningParts.push('仅基于原价和折旧模型计算，无市场参考数据');
  } else if (marketAvg !== null) {
    suggestedPrice = marketAvg;
    confidence = 0.5;
    reasoningParts.push('仅基于市场参考均价，无原价信息');
  } else {
    suggestedPrice = categoryRate * conditionFactor * 100;
    confidence = 0.2;
    reasoningParts.push('无原价和市场参考，仅给出归一化指数');
  }

  var margin = Math.max(1, Math.round(suggestedPrice * (1 - confidence) * 0.2 * 100) / 100);
  priceRange = {
    min: Math.max(0, Math.round((suggestedPrice - margin) * 100) / 100),
    max: Math.round((suggestedPrice + margin) * 100) / 100,
  };

  return {
    success: true,
    suggestedPrice,
    priceRange,
    confidence,
    reasoning: reasoningParts.join('。'),
    breakdown: {
      categoryBaseRate: categoryRate,
      conditionFactor,
      marketAverage: marketAvg,
      marketAdjustment: marketAvg !== null,
    },
  };
}

function errorResult(message) {
  return {
    success: false,
    error: message,
  };
}

module.exports = { recommend };
