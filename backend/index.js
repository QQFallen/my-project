// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { sequelize } = require('./config/db'); // Импортируем sequelize
const User = require('./models/User'); // Импортируем модель User
const Event = require('./models/Event'); // Импортируем модель Event
const { ValidationError, NotFoundError } = require('./errors'); // Импортируем кастомные ошибки

// Загрузка переменных окружения
dotenv.config();

// Создание приложения Express
const app = express();

// Настройка middleware
app.use(cors()); // Разрешение кросс-доменных запросов
app.use(express.json()); // Обработка входящих JSON-запросов
app.use(morgan('dev')); // Логирование запросов
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Определение порта
const PORT = process.env.PORT || 5000;

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
app.post('/users', async (req, res, next) => {
  try {
    const { name, email } = req.body; // Деструктуризация req.body
    if (!name || !email) {
      throw new ValidationError('Name and email are required.');
    }

    // Проверка уникальности email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already exists.');
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    next(error); // Передаем ошибку в обработчик ошибок
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

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
 *                 description: ID пользователя, создающего мероприятие (можно получить из списка пользователей GET /users)
 *                 example: 1
 *               location:
 *                 type: string
 *                 description: Место проведения мероприятия
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 */
app.post('/events', async (req, res, next) => {
  try {
    console.log('Получен запрос на создание мероприятия:', req.body);
    const { title, description, date, createdBy, location } = req.body;
    
    if (!title || !date || !createdBy || !location) {
      throw new ValidationError('Title, date, createdBy, and location are required.');
    }

    // Преобразуем createdBy в число и проверяем, что это валидное число
    const userId = Number(createdBy);
    if (isNaN(userId)) {
      throw new ValidationError('createdBy must be a valid user ID (number)');
    }

    // Проверяем существование пользователя
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
    
    console.log('Мероприятие успешно создано:', event.toJSON());
    res.status(201).json(event);
  } catch (error) {
    console.error('Ошибка при создании мероприятия:', error);
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
app.get('/events', async (req, res, next) => {
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
app.get('/events/:id', async (req, res, next) => {
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
app.put('/events/:id', async (req, res, next) => {
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
app.delete('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      throw new NotFoundError('Event not found.');
    }
    const eventName = event.title; // Сохраняем название мероприятия
    await event.destroy();
    res.status(200).json({ message: `Мероприятие "${eventName}" успешно удалено.` }); // Возвращаем сообщение об успешном удалении
  } catch (error) {
    next(error);
  }
});

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  
  if (err instanceof ValidationError) {
    return res.status(err.statusCode || 400).json({ 
      error: err.message,
      type: 'ValidationError'
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode || 404).json({ 
      error: err.message,
      type: 'NotFoundError'
    });
  }
  
  // Обработка ошибок Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ 
      error: err.message,
      type: 'DatabaseError'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    type: 'ServerError'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Swagger документация доступна по адресу: http://localhost:${PORT}/api-docs`);
});