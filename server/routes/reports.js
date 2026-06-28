// 【模块五：后台管理】用户提交举报
// AI 生成：手动调整前请勿修改
const express = require('express');
const { db, genId } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ message: '请填写举报类型、对象和原因' });
  }
  if (!['product', 'user', 'comment'].includes(targetType)) {
    return res.status(400).json({ message: '无效的举报类型' });
  }

  const report = {
    id: genId('report'),
    targetType,
    targetId: parseInt(targetId),
    reason,
    reporterId: req.user.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.reports.push(report);
  res.status(201).json({ message: '举报已提交', report });
});

module.exports = router;
