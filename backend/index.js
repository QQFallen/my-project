// Импорт необходимых модулей
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { sequelize } = require('./config/db'); // Импортируем sequelize
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { ValidationError, NotFoundError } = require('./errors'); // Импортируем кастомные ошибки
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const protectedRoutes = require('./routes/protected');

// Загрузка переменных окружения
dotenv.config();

// Создание приложения Express
const app = express();

// Настройка middleware
app.use(cors()); // Разрешение кросс-доменных запросов
app.use(express.json()); // Обработка входящих JSON-запросов
app.use(morgan('dev'));

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Подключение маршрутов
app.use('/users', userRoutes);
// app.use('/events', eventRoutes); // Удалено, чтобы не было дублирования маршрутов
app.use('/auth', authRoutes);
app.use(passport.initialize());
app.use(publicRoutes); // Публичные маршруты (например, GET /events)
app.use(protectedRoutes); // Защищённые маршруты (например, POST /events)

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Защищенный маршрут, требующий JWT токен
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный доступ к защищенному маршруту
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Доступ разрешён!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Доступ запрещен
 */
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Доступ разрешён!', user: req.user });
});

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Неверный токен',
      message: 'Токен недействителен или подделан'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Токен истек',
      message: 'Срок действия токена истек'
    });
  }

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

// Определение порта
const PORT = process.env.PORT || 5000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Swagger документация доступна по адресу: http://localhost:${PORT}/api-docs`);
});