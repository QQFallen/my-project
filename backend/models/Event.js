const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Импортируем sequelize

class Event extends Model {}

// Определяем структуру модели
Event.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // Поле обязательно
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false, // Поле обязательно
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // Имя таблицы пользователей
      key: 'id',
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false, // Поле обязательно
  },
}, {
  sequelize,
  modelName: 'Event',
});

// Синхронизация модели с базой данных
const syncEventModel = async () => {
  await Event.sync();
};

syncEventModel();

module.exports = Event;