const express = require('express');
const { LearningRecord, Assignment, Document } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/learning/my-tasks
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const records = await LearningRecord.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Assignment,
        include: [{ model: Document, attributes: ['id', 'title', 'fileType'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      total: records.length,
      completed: records.filter(r => r.status === 'completed').length,
      inProgress: records.filter(r => r.status === 'in_progress').length,
      notStarted: records.filter(r => r.status === 'not_started').length
    };

    res.json({ records, stats });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

module.exports = router;
