// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./config/db'); // Импортируем sequelize
const User = require('./models/User'); // Импортируем модель User
const Event = require('./models/Event'); // Импортируем модель Event

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
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body; // Деструктуризация req.body
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получение всех пользователей
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание мероприятия
app.post('/events', async (req, res) => {
  try {
    const { title, description, date, createdBy } = req.body;
    const event = await Event.create({ title, description, date, createdBy });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получение всех мероприятий
app.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
///ffas