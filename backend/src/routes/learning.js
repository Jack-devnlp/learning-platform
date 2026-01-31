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

// GET /api/learning/progress/:assignmentId
router.get('/progress/:assignmentId', auth, async (req, res) => {
  try {
    const record = await LearningRecord.findOne({
      where: {
        userId: req.user.id,
        assignmentId: req.params.assignmentId
      },
      include: [{
        model: Assignment,
        include: [{ model: Document, attributes: ['id', 'title', 'fileType', 'fileUrl'] }]
      }]
    });

    if (!record) {
      return res.status(404).json({ error: 'Learning record not found' });
    }

    res.json({ record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// POST /api/learning/progress/:assignmentId
router.post('/progress/:assignmentId', auth, async (req, res) => {
  try {
    const { progress, totalTime } = req.body;

    const record = await LearningRecord.findOne({
      where: {
        userId: req.user.id,
        assignmentId: req.params.assignmentId
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Learning record not found' });
    }

    const updateData = { progress, totalTime };

    if (progress === 100 && record.status !== 'completed') {
      updateData.status = 'completed';
      updateData.endTime = new Date();
    } else if (record.status === 'not_started') {
      updateData.status = 'in_progress';
      updateData.startTime = new Date();
    }

    await record.update(updateData);

    res.json({ record });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = router;
