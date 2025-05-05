const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Импортируем sequelize
const bcrypt = require('bcryptjs'); // Импортируем bcryptjs

class User extends Model {}

// Определяем структуру модели
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Поле обязательно
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false, // Поле обязательно
    unique: true, // Email должен быть уникальным
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // Пароль обязателен
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Дата регистрации по умолчанию
  },
}, {
  sequelize,
  modelName: 'User',
});

// Хеширование пароля перед сохранением
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// Синхронизация модели с базой данных
const syncUserModel = async () => {
  await User.sync();
};

syncUserModel();

module.exports = User; 