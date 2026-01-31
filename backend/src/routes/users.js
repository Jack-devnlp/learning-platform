const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { User, Department } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/users
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      [require('sequelize').Op.or]: [
        { username: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: Department, attributes: ['id', 'name'] }],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// POST /api/users
router.post('/',
  auth,
  requireAdmin,
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'user']).withMessage('Invalid role')
  ]),
  async (req, res) => {
    try {
      const { username, name, password, role, departmentId } = req.body;

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        name,
        passwordHash,
        role,
        departmentId,
        status: 'active'
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// PUT /api/users/:id
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, role, departmentId, status } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ name, role, departmentId, status });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ status: 'inactive' });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;
