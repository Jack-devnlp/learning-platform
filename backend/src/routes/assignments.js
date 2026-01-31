const express = require('express');
const { body } = require('express-validator');
const { Assignment, AssignmentTarget, Document, User, Department, LearningRecord } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/assignments
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Assignment.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: Document, attributes: ['id', 'title'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: AssignmentTarget }
      ]
    });

    res.json({
      assignments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// POST /api/assignments
router.post('/',
  auth,
  requireAdmin,
  validate([
    body('documentId').notEmpty(),
    body('targets').isArray({ min: 1 }).withMessage('At least one target is required')
  ]),
  async (req, res) => {
    try {
      const { documentId, requiredTime, deadline, hasQuiz, targets } = req.body;

      const assignment = await Assignment.create({
        documentId,
        requiredTime,
        deadline: deadline || null,
        hasQuiz: hasQuiz || false,
        createdBy: req.user.id
      });

      // Create assignment targets
      await AssignmentTarget.bulkCreate(
        targets.map(target => ({
          assignmentId: assignment.id,
          targetId: target.id,
          targetType: target.type
        }))
      );

      // Create learning records for users
      const userIds = [];
      for (const target of targets) {
        if (target.type === 'user') {
          userIds.push(target.id);
        } else if (target.type === 'department') {
          const users = await User.findAll({
            where: { departmentId: target.id },
            attributes: ['id']
          });
          userIds.push(...users.map(u => u.id));
        }
      }

      // Remove duplicates
      const uniqueUserIds = [...new Set(userIds)];
      await LearningRecord.bulkCreate(
        uniqueUserIds.map(userId => ({
          userId,
          assignmentId: assignment.id,
          status: 'not_started'
        }))
      );

      res.status(201).json({ assignment });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  }
);

// DELETE /api/assignments/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    await assignment.update({ status: 'inactive' });
    res.json({ message: 'Assignment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel assignment' });
  }
});

module.exports = router;
