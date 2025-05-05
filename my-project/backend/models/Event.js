const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Импортируем sequelize
const User = require('./User');

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
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false, // Поле обязательно
  },
}, {
  sequelize,
  modelName: 'Event',
});

// Определяем связь с пользователем
Event.belongsTo(User, { foreignKey: 'createdBy' });

// Синхронизация модели с базой данных
const syncEventModel = async () => {
  try {
    await Event.sync({ force: true }); // Используем force: true для пересоздания таблицы
    console.log('Модель Event успешно синхронизирована');
  } catch (error) {
    console.error('Ошибка при синхронизации модели Event:', error);
  }
};

syncEventModel();

module.exports = Event;