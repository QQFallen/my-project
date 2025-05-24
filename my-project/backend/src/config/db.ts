import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

// Загрузка переменных окружения
config();

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'event_management',
    logging: false,
});

// Функция для проверки подключения к базе данных
const authenticate = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с базой данных установлено успешно.');
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error);
    }
};

authenticate();

export { sequelize, authenticate };
