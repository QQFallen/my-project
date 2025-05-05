const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');

// Middleware для проверки роли
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
    }
    next();
  };
}

router.post('/', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ValidationError('Имя, email и пароль обязательны для заполнения.');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Пользователь с таким email уже существует.');
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 */
router.get('/', 
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 