import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger';
import passport from 'passport';
import { jwtStrategy } from './config/passport';
import { sequelize } from './config/db';
import { syncDatabase } from './config/database';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import publicRoutes from './routes/public';
import './models/User';
import './models/Event';
import { errorHandler } from '@middleware/errorHandler';

// Загрузка переменных окружения
dotenv.config();

// Создание приложения Express
const app = express();

// Настройка CORS
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Обработка предварительных запросов
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Max-Age', '86400');
        res.status(204).end();
        return;
    }
    
    next();
});

// Добавляем логирование запросов
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

app.use(express.json());
app.use(morgan('dev'));

// Passport middleware
app.use(passport.initialize());
passport.use(jwtStrategy);

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Event Management API Documentation"
}));

// Подключение маршрутов
app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/', publicRoutes);

// Добавляем обработку 404 ошибок
app.use((req: Request, res: Response) => {
    console.log('404 - Маршрут не найден:', req.method, req.url);
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Добавляем обработчик ошибок
app.use(errorHandler);

// Проверка подключения к базе данных
sequelize.authenticate()
    .then(() => {
        console.log('Подключение к базе данных установлено успешно.');
    })
    .catch((error: Error) => {
        console.error('Ошибка подключения к базе данных:', error);
    });

// Определение порта
const PORT = process.env.PORT || 5000;

// Инициализация базы данных и запуск сервера
const startServer = async (): Promise<void> => {
    try {
        // Синхронизируем базу данных
        await syncDatabase();

        // Запускаем сервер
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
            console.log(`Swagger документация доступна по адресу: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
        process.exit(1);
    }
};

startServer();
