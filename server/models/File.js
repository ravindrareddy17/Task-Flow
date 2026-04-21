const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  publicId: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  name: {
    type: DataTypes.STRING(255),
    defaultValue: 'file',
  },
  format: {
    type: DataTypes.STRING(50),
    defaultValue: null,
  },
  size: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  taskId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  messageId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  projectId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'files',
  timestamps: true,
});

module.exports = File;
