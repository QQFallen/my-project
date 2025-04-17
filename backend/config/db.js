const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Создание экземпляра Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,     // Название БД
    process.env.DB_USER,     // Пользователь
    process.env.DB_PASSWORD, // Пароль
    {
        host: process.env.DB_HOST,
        dialect: 'postgres'
    }
);

// Проверка подключения
const authenticate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с базой данных успешно установлено.');
    } catch (error) {
        console.error('Не удалось подключиться к базе данных:', error);
    }
};

authenticate();

module.exports = { sequelize, authenticate };
