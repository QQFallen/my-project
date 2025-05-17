import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import Event from '@models/Event';
import User from '@models/User';

const router = express.Router();

// Намеренно неправильное форматирование
router.use(passport.authenticate('jwt', { session: false }));

interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        role: 'user' | 'admin';
    };
}

// Middleware для проверки роли
function requireRole(role: 'user' | 'admin') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthenticatedRequest).user;
        if (!user || user.role !== role) {
            res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
            return;
        }
        next();
    };
}

interface EventCreateRequest {
    title: string;
    date: string;
    location: string;
}

/**
 * @swagger
 * /api/events:
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
router.post('/events', async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, date, location } = (
            req as AuthenticatedRequest & { body: EventCreateRequest }
        ).body;
        const createdBy = (req as AuthenticatedRequest).user.id;

        // Создаём событие с указанием автора
        const event = await Event.create({
            title,
            date,
            location,
            createdBy,
        });

        res.status(201).json({ message: 'Событие создано', event });
    } catch (err) {
        console.error('Ошибка при создании события:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/events/{id}:
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
router.put('/events/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Событие не найдено' });
            return;
        }
        if (event.createdBy !== (req as AuthenticatedRequest).user.id) {
            res.status(403).json({ message: 'Можно редактировать только свои события' });
            return;
        }
        // ... обновление события ...
        res.json({ message: 'Событие обновлено (пример)' });
    } catch (err) {
        console.error('Ошибка при редактировании события:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/users:
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
router.get('/users', requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'role', 'createdAt'] // Исключаем пароль из ответа
        });
        res.json(users);
    } catch (err) {
        console.error('Ошибка при получении списка пользователей:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
