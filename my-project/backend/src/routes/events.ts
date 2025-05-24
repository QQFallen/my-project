import { Router, Request, Response } from 'express';
import { literal, CreationAttributes, Op } from 'sequelize';
import Event from '@models/Event';
import dotenv from 'dotenv';
import { authenticate } from '@middleware/auth';

dotenv.config();

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EventCreateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Мероприятие"
 *         description:
 *           type: string
 *           example: "Описание события"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-05-22T15:00:00.000Z"
 *         location:
 *           type: string
 *           example: "Москва"
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/image.jpg"
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     description: Возвращает список всех мероприятий, с возможностью включить удалённые.
 *     parameters:
 *       - name: showDeleted
 *         in: query
 *         required: false
 *         description: Показывать ли удалённые мероприятия
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка при получении списка мероприятий
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const showDeleted = req.query.showDeleted === 'true';
    let events;

    if (showDeleted) {
      // Если showDeleted=true, возвращаем все мероприятия
      events = await Event.findAll({
        order: [['createdAt', 'DESC']],
        paranoid: false // Отключаем paranoid режим для получения удаленных записей
      });
    } else {
      // Если showDeleted=false, возвращаем только неудаленные
      events = await Event.findAll({
        order: [['createdAt', 'DESC']]
      });
    }
    
    res.status(200).json(events);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при получении списка мероприятий',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить одно мероприятие по ID
 *     description: Возвращает информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при поиске мероприятия
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при поиске мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создание нового мероприятия
 *     description: >
 *       Создаёт новое мероприятие с проверкой на лимит по количеству событий, которые могут быть созданы за 24 часа.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateRequest'
 *     responses:
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Превышен лимит на создание мероприятий
 *       500:
 *         description: Ошибка при создании мероприятия
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, date, location, imageUrl } = req.body;
    // createdBy берём из авторизации, если есть
    const createdBy = req.auth?.user?.id;

    if (!title || !date || !location) {
      return res
        .status(400)
        .json({ error: 'Название, дата и место проведения обязательны' });
    }
    if (!createdBy) {
      return res.status(401).json({ error: 'Не удалось определить пользователя' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      imageUrl: imageUrl || 'https://vet-centre.by/wp-content/uploads/2016/11/kot-eti-udivitelnye-kotiki.jpg',
      createdBy
    } as CreationAttributes<Event>);

    res.status(201).json(event);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.log(err);
    res.status(500).json({
      error: 'Ошибка при создании мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     description: Обновляет информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Мероприятие успешно обновлено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при обновлении мероприятия
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.update(req.body);
    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при обновлении мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Мягкое удаление мероприятия
 *     description: Помечает мероприятие как удалённое, устанавливая поле deletedAt.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие помечено как удалённое
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при удалении мероприятия
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.destroy();
    
    res.status(200).json({ message: 'Мероприятие помечено как удалённое' });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при удалении мероприятия',
      details: err.message,
    });
  }
});

export default router;
