const express = require('express');
const passport = require('passport');
const router = express.Router();
const Event = require('../models/Event');

// Применяем аутентификацию ко всем маршрутам этого файла
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое событие (требуется авторизация)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Событие создано
 *       401:
 *         description: Неавторизован
 */
// Пример защищённого маршрута (создание события)
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

module.exports = router; 