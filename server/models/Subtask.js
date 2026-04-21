const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subtask = sequelize.define('Subtask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'subtasks',
  timestamps: true,
});

module.exports = Subtask;
