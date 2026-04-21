const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PersonalTask = sequelize.define('PersonalTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    defaultValue: null,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'personal_tasks',
  timestamps: true,
});

module.exports = PersonalTask;
