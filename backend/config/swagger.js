const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API documentation for Event Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
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
        }
      }
    }
  },
  apis: [
    path.join(__dirname, '../routes/*.js'), // Ищем документацию во всех файлах в папке routes
    path.join(__dirname, '../index.js') // И в основном файле
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 