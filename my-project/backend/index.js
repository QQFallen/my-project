// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Определение порта
const PORT = process.env.PORT || 5000;

// Создание пользователя
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

// Получение всех пользователей
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Создание мероприятия
app.post('/events', async (req, res, next) => {
  try {
    const { title, description, date, createdBy, location } = req.body;
    if (!title || !date || !createdBy || !location) {
      throw new ValidationError('Title, date, createdBy, and location are required.');
    }
    const event = await Event.create({ title, description, date, createdBy, location });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// Получение всех мероприятий
app.get('/events', async (req, res, next) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Получение одного мероприятия по ID
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

// Обновление мероприятия
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

// Удаление мероприятия
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
  if (err instanceof ValidationError) {
    return res.status(err.statusCode || 400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode || 404).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});