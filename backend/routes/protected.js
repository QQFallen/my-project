const express = require('express');
const passport = require('passport');
const router = express.Router();
const Event = require('../models/Event');

// Применяем аутентификацию ко всем маршрутам этого файла
router.use(passport.authenticate('jwt', { session: false }));

// Middleware для проверки роли
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
    }
    next();
  };
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список всех пользователей (только для admin)
 *     description: Доступен только для пользователей с ролью admin.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей (только для admin)
 *       403:
 *         description: Доступ запрещён
 */
// Пример защищённого маршрута только для admin (например, управление пользователями)
router.get('/users', requireRole('admin'), async (req, res) => {
  // Здесь логика получения всех пользователей (только для admin)
  // const users = await User.findAll();
  res.json({ message: 'Только для admin' });
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое событие (для user)
 *     description: Доступен для всех авторизованных пользователей с ролью user или admin. createdBy устанавливается автоматически.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateRequest'
 *     responses:
 *       201:
 *         description: Событие успешно создано
 *       401:
 *         description: Неавторизован
 */
// Пример защищённого маршрута для user (создание события)
router.post('/events', async (req, res) => {
  try {
    const { title, date, location } = req.body;
    const createdBy = req.user.id;

    // Создаём событие с указанием автора
    const event = await Event.create({
      title,
      date,
      location,
      createdBy
    });

    res.status(201).json({ message: 'Событие создано', event });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Редактировать событие (только для автора)
 *     description: Доступен только автору события (user или admin, если он автор).
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateRequest'
 *     responses:
 *       200:
 *         description: Событие обновлено
 *       403:
 *         description: Можно редактировать только свои события
 *       404:
 *         description: Событие не найдено
 */
// Пример редактирования события: только автор может редактировать
router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Событие не найдено' });
    if (event.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Можно редактировать только свои события' });
    }
    // ... обновление события ...
    res.json({ message: 'Событие обновлено (пример)' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 