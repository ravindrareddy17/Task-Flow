const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    defaultValue: null,
  },
  taskId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  projectId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
});

module.exports = Message;
