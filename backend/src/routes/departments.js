const express = require('express');
const { body } = require('express-validator');
const { Department } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// POST /api/departments
router.post('/',
  auth,
  requireAdmin,
  validate([
    body('name').notEmpty().withMessage('Name is required')
  ]),
  async (req, res) => {
    try {
      const { name, parentId } = req.body;
      const department = await Department.create({ name, parentId });
      res.status(201).json({ department });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create department' });
    }
  }
);

// PUT /api/departments/:id
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    await department.update({ name, parentId });
    res.json({ department });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// DELETE /api/departments/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    await department.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router;
