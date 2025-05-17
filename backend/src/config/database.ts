import { config } from 'dotenv';
import { sequelize } from './db';

config();

export const syncDatabase = async (): Promise<void> => {
    try {
        // Синхронизируем модели с сохранением данных
        await sequelize.sync({ alter: true });
        console.log('База данных синхронизирована');

        // Выводим информацию о существующих таблицах
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Существующие таблицы:', tables);

        // Проверяем структуру таблиц
        const userColumns = await sequelize.getQueryInterface().describeTable('Users');
        const eventColumns = await sequelize.getQueryInterface().describeTable('Events');
        console.log('Структура таблицы Users:', userColumns);
        console.log('Структура таблицы Events:', eventColumns);
    } catch (error) {
        console.error('Ошибка при синхронизации базы данных:', error);
        throw error;
    }
}; 