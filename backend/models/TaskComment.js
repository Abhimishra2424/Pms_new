const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('TaskComment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'task_comments', timestamps: false });
