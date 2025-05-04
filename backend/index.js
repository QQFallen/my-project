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
app.use('/events', eventRoutes);

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  
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