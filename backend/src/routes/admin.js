const express = require('express');
const { User, Document, Assignment, LearningRecord } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalDocuments, totalAssignments] = await Promise.all([
      User.count(),
      Document.count({ where: { status: 'active' } }),
      Assignment.count({ where: { status: 'active' } })
    ]);

    const completedRecords = await LearningRecord.count({
      where: { status: 'completed' }
    });
    const totalRecords = await LearningRecord.count();
    const completionRate = totalRecords > 0
      ? Math.round((completedRecords / totalRecords) * 100)
      : 0;

    const recentDocuments = await Document.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'uploader', attributes: ['name'] }]
    });

    const recentLearning = await LearningRecord.findAll({
      order: [['updatedAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, attributes: ['name'] },
        { model: Assignment, include: [{ model: Document, attributes: ['title'] }] }
      ]
    });

    res.json({
      stats: {
        totalUsers,
        totalDocuments,
        totalAssignments,
        completionRate
      },
      recentDocuments,
      recentLearning: recentLearning.map(record => ({
        userName: record.User.name,
        documentTitle: record.Assignment.Document.title,
        progress: record.progress
      }))
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

module.exports = router;
