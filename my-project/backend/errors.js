// my-project/backend/errors.js

class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.statusCode = 400; // Код ошибки 400 для валидации
    }
  }
  
  class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
      this.statusCode = 404; // Код ошибки 404 для не найденных ресурсов
    }
  }
  
  module.exports = { ValidationError, NotFoundError };