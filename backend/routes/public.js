const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех событий (публично)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Список событий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
// Публичный маршрут для получения всех событий
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 