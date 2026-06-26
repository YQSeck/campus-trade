// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
var express = require('express');
var router = express.Router();
var pricing = require('./pricing');

// POST /api/skills/recommend
// 鑷姩瀹氫环寤鸿鎺ュ彛
router.post('/recommend', function(req, res) {
  var result = pricing.recommend(req.body);
  res.json(result);
});

// GET /api/skills/recommend/meta
// 鏌ョ湅瀹氫环寮曟搸鍏冩暟鎹紙鍙敤鍒嗙被銆佹垚鑹茬瓑绾э級
router.get('/recommend/meta', function(req, res) {
  var pricingData = require('./pricingData');
  res.json({
    categories: pricingData.validCategories,
    conditions: pricingData.validConditions,
    baseRates: pricingData.categoryBaseRates,
    conditionFactors: pricingData.conditionFactors
  });
});

module.exports = router;
