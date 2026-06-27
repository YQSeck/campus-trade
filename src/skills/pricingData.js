// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
// 瀹氫环鍙傝€冨熀鍑嗘暟鎹?// 姣忔潯璁板綍鍖呭惈锛氱被鐩悕绉般€佸熀鍑嗘姌鎵ｇ巼锛堜簩鎵嬩环/鍘熶环锛夈€佹渶鐭娇鐢ㄦ弿杩般€佹渶闀夸娇鐢ㄦ弿杩?
var categoryBaseRates = {
  '涔︾睄': 0.45,
  '鐢靛瓙浜у搧': 0.55,
  '鐢熸椿鐢ㄥ搧': 0.40,
  '琛ｇ墿': 0.35,
  '鍏朵粬': 0.45
};

var conditionFactors = {
  '鍏ㄦ柊': 0.95,
  '鍑犱箮鍏ㄦ柊': 0.80,
  '杞诲井浣跨敤': 0.60,
  '鏄庢樉浣跨敤': 0.40,
  '鑰佹棫': 0.25
};

// 鍒嗙被鎻忚堪鏄犲皠锛堢敤浜?reasoning 杈撳嚭锛?var categoryDescriptions = {
  '涔︾睄': '鏁欐潗銆佸弬鑰冧功鎶樻棫杈冨揩锛岄櫎闈炴槸鐑棬涓撲笟涔?,
  '鐢靛瓙浜у搧': '闅忔崲浠ｆ姌浠锋槑鏄撅紝娈嬪€煎彇鍐充簬鍝佺墝鍜岄厤缃?,
  '鐢熸椿鐢ㄥ搧': '瀹炵敤鎬у晢鍝侊紝鎶樻棫鍙栧喅浜庡瑙傜（鎹熺▼搴?,
  '琛ｇ墿': '浜屾墜鏈嶉グ鎶樹环鏈€楂橈紝闄ら潪涓哄搧鐗屾',
  '鍏朵粬': '鎸変竴鑸簩鎵嬫姌鏃х巼浼扮畻'
};

// 鏈夋晥鍒嗙被鍒楄〃
var validCategories = Object.keys(categoryBaseRates);
var validConditions = Object.keys(conditionFactors);

function getCategoryBaseRate(category) {
  return categoryBaseRates[category] || categoryBaseRates['鍏朵粬'];
}

function getConditionFactor(condition) {
  return conditionFactors[condition] || 0.50;
}

function isValidCategory(category) {
  return validCategories.indexOf(category) !== -1;
}

function isValidCondition(condition) {
  return validConditions.indexOf(condition) !== -1;
}

module.exports = {
  categoryBaseRates: categoryBaseRates,
  conditionFactors: conditionFactors,
  categoryDescriptions: categoryDescriptions,
  validCategories: validCategories,
  validConditions: validConditions,
  getCategoryBaseRate: getCategoryBaseRate,
  getConditionFactor: getConditionFactor,
  isValidCategory: isValidCategory,
  isValidCondition: isValidCondition
};
