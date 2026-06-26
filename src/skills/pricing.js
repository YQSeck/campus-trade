// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var pricingData = require('./pricingData');

// 鑷姩瀹氫环寮曟搸
// 绠楁硶锛氬缓璁环鏍?= 鍘熶环 脳 鍒嗙被鍩哄噯鎶樻墸鐜?脳 鎴愯壊鎶樻棫鍥犲瓙 脳 (1 + 甯傚満璋冩暣)
// 濡傛灉鎻愪緵浜嗗競鍦哄弬鑰冧环鍒楄〃锛屽姞鏉冭瀺鍚堟湰绠楁硶缁撴灉鍜屽競鍦哄潎浠?
function recommend(input) {
  var category = input.category;
  var condition = input.condition;
  var originalPrice = input.originalPrice;
  var marketPrices = input.marketPrices;

  // 鍙傛暟鏍￠獙
  if (!category || !pricingData.isValidCategory(category)) {
    return errorResult('鏃犳晥鍒嗙被锛屽彲閫夊€硷細' + pricingData.validCategories.join('銆?));
  }
  if (!condition || !pricingData.isValidCondition(condition)) {
    return errorResult('鏃犳晥鎴愯壊锛屽彲閫夊€硷細' + pricingData.validConditions.join('銆?));
  }

  var categoryRate = pricingData.getCategoryBaseRate(category);
  var conditionFactor = pricingData.getConditionFactor(condition);

  // 鍩哄噯浠锋牸璁＄畻
  var basePrice = null;
  if (originalPrice && originalPrice > 0) {
    basePrice = originalPrice * categoryRate * conditionFactor;
    basePrice = Math.round(basePrice * 100) / 100;
  }

  // 甯傚満鍙傝€冧环鏍硷紙濡傛灉鎻愪緵锛?  var marketAvg = null;
  if (marketPrices && marketPrices.length > 0) {
    var sum = marketPrices.reduce(function(a, b) { return a + b; }, 0);
    marketAvg = sum / marketPrices.length;
    marketAvg = Math.round(marketAvg * 100) / 100;
  }

  // 缁煎悎璁＄畻
  var suggestedPrice;
  var confidence;
  var priceRange;
  var reasoningParts = [];

  reasoningParts.push(category + '绫讳簩鎵嬪熀鍑嗘姌鎵ｇ巼绾?' + Math.round(categoryRate * 100) + '%锛? + pricingData.categoryDescriptions[category] + '锛?);
  reasoningParts.push(condition + '鎶樻棫鍥犲瓙涓?' + Math.round(conditionFactor * 100) + '%');

  if (basePrice !== null && marketAvg !== null) {
    suggestedPrice = Math.round((basePrice * 0.6 + marketAvg * 0.4) * 100) / 100;
    confidence = 0.85;
    reasoningParts.push('缁撳悎鍘熶环璁＄畻锛埪? + basePrice.toFixed(2) + '锛変笌甯傚満鍙傝€冨潎浠凤紙楼' + marketAvg.toFixed(2) + '锛夛紝鎸?6:4 鍔犳潈');
  } else if (basePrice !== null) {
    suggestedPrice = basePrice;
    confidence = 0.60;
    reasoningParts.push('浠呭熀浜庡師浠峰拰鎶樻棫妯″瀷璁＄畻锛屾棤甯傚満鍙傝€冩暟鎹?);
  } else if (marketAvg !== null) {
    suggestedPrice = marketAvg;
    confidence = 0.50;
    reasoningParts.push('浠呭熀浜庡競鍦哄弬鑰冨潎浠凤紝鏃犲師浠蜂俊鎭?);
  } else {
    suggestedPrice = categoryRate * conditionFactor * 100;
    confidence = 0.20;
    reasoningParts.push('鏃犲師浠峰拰甯傚満鍙傝€冿紝浠呯粰鍑哄綊涓€鍖栨寚鏁?);
  }

  // 浠锋牸鍖洪棿锛氬缓璁环涓婁笅娴姩 (1 - confidence) * 20%
  var margin = Math.max(1, Math.round(suggestedPrice * (1 - confidence) * 0.20 * 100) / 100);
  priceRange = {
    min: Math.max(0, Math.round((suggestedPrice - margin) * 100) / 100),
    max: Math.round((suggestedPrice + margin) * 100) / 100
  };

  return {
    success: true,
    suggestedPrice: suggestedPrice,
    priceRange: priceRange,
    confidence: confidence,
    reasoning: reasoningParts.join('銆?),
    breakdown: {
      categoryBaseRate: categoryRate,
      conditionFactor: conditionFactor,
      marketAverage: marketAvg,
      marketAdjustment: marketAvg !== null
    }
  };
}

function errorResult(message) {
  return {
    success: false,
    error: message
  };
}

module.exports = { recommend: recommend };
