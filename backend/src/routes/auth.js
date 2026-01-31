const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, Department } = require('../models');
const { auth, JWT_SECRET } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/login
router.post('/login',
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({
        where: { username },
        include: [{ model: Department, attributes: ['id', 'name'] }]
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.Department
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Department, attributes: ['id', 'name'] }],
      attributes: ['id', 'username', 'name', 'role', 'status']
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, (req, res) => {
  // Client-side token removal
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
