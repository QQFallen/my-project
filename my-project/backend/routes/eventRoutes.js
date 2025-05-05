const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../errors');

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название мероприятия
 *               description:
 *                 type: string
 *                 description: Описание мероприятия
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время мероприятия
 *               createdBy:
 *                 type: integer
 *                 description: ID пользователя, создающего мероприятие
 *               location:
 *                 type: string
 *                 description: Место проведения мероприятия
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, date, createdBy, location } = req.body;
    
    if (!title || !date || !createdBy || !location) {
      throw new ValidationError('Title, date, createdBy, and location are required.');
    }

    const userId = Number(createdBy);
    if (isNaN(userId)) {
      throw new ValidationError('createdBy must be a valid user ID (number)');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const event = await Event.create({ 
      title, 
      description, 
      date, 
      createdBy: userId,
      location 
    });
    
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, date, createdBy, location } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    if (!title || !date || !createdBy || !location) {
      throw new ValidationError('Title, date, createdBy, and location are required.');
    }
    await event.update({ title, description, date, createdBy, location });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    const eventName = event.title;
    await event.destroy();
    res.status(200).json({ message: `Мероприятие "${eventName}" успешно удалено.` });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 