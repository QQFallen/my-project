import express, { Request, Response } from 'express';
import Event from '@models/Event';

const router = express.Router();

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
// Маршрут для получения списка событий (публичный)
router.get('/events', async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await Event.findAll({
            order: [['date', 'ASC']],
        });
        res.json(events);
    } catch (err) {
        console.error('Ошибка при получении списка событий:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
