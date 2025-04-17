// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Загрузка переменных окружения
dotenv.config();

// Создание приложения Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

// Порт сервера
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});