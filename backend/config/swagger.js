const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API документация для системы управления мероприятиями',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен для авторизации. Формат: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль пользователя'
            }
          }
        },
        AuthRegisterRequest: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль пользователя'
            }
          }
        },
        Event: {
          type: 'object',
          required: ['title', 'date', 'createdBy', 'location'],
          properties: {
            title: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date-time'
            },
            createdBy: {
              type: 'string'
            },
            location: {
              type: 'string'
            }
          }
        },
        EventCreateRequest: {
          type: 'object',
          required: ['title', 'date', 'location'],
          properties: {
            title: { type: 'string', description: 'Название события' },
            date: { type: 'string', format: 'date-time', description: 'Дата и время' },
            location: { type: 'string', description: 'Место проведения' }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../routes/public.js'),
    path.join(__dirname, '../routes/protected.js'),
    path.join(__dirname, '../index.js')
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 