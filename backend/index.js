// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Загрузка переменных окружения
dotenv.config();

// Создание приложения Express
const app = express();

// Настройка middleware
app.use(cors()); // Разрешение кросс-доменных запросов
app.use(express.json()); // Обработка входящих JSON-запросов

// Определение порта
const PORT = process.env.PORT || 5000;

// Тестовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Сервер работает!' }); // Возвращаем простой JSON-ответ
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
