const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskAssignment = sequelize.define('TaskAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'task_assignments',
  timestamps: true,
});

module.exports = TaskAssignment;
