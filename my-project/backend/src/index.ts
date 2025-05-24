import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { authenticate } from '@config/db';
import { syncDatabase } from '@config/database';
import userRoutes from '@routes/userRoutes';
import eventRoutes from '@routes/events';
import authRoutes from '@routes/auth';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';
import '@config/passport';

dotenv.config();

const app: Application = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description:
        'Документация для API управления мероприятиями и пользователями',
      contact: {
        name: 'Поддержка',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
      },
    },
    tags: [
      { name: 'Auth', description: 'Аутентификация и авторизация' },
      { name: 'Users', description: 'Операции с пользователями' },
      { name: 'Events', description: 'Управление мероприятиями' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен в формате: Bearer <ваш_токен>',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Произошла ошибка' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Локальный сервер разработки',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Продакшен сервер',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // URL фронтенда
  credentials: true, // Важно для работы с куками и авторизацией
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

// Custom logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${req.ip}`,
  );
  next();
});

// Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Event Management API Docs',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  }),
);

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API работает!',
    docs: '/api-docs',
    status: 'OK',
  });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Error handler
app.use(
  (
    err: Error & { status?: number },
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    console.error(`[ERROR] ${err.stack}`);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  },
);

// DB Init
const initializeDB = async (): Promise<void> => {
  try {
    await authenticate();
    await syncDatabase();

    console.log('База данных подключена и синхронизирована');
  } catch (err: unknown) {
    const error = err as Error;

    console.error('Ошибка инициализации БД:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);

      console.log(`Документация доступна по http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err: unknown) => {
    const error = err as Error;

    console.error('Ошибка при запуске сервера:', error.message);
  });
