// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./config/db'); // Импортируем sequelize

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

// Проверка соединения с базой данных
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных успешно установлено.');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
  }
};

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  testDatabaseConnection(); // Проверяем соединение при запуске сервера
});