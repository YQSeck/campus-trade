// 【模块八：开放 Skill】定价 API 路由
// AI 生成：手动调整前请勿修改
var express = require("express");
var router = express.Router();
var pricing = require("./pricing");

router.post("/recommend", function (req, res) {
  var result = pricing.recommend(req.body);
  res.json(result);
});

router.get("/recommend/meta", function (req, res) {
  var pricingData = require("./pricingData");
  res.json({
    categories: pricingData.validCategories,
    conditions: pricingData.validConditions,
    baseRates: pricingData.categoryBaseRates,
    conditionFactors: pricingData.conditionFactors,
  });
});

module.exports = router;
