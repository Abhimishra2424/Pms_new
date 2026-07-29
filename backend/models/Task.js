const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('todo', 'in_progress', 'done'), defaultValue: 'todo' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  assignee_id: { type: DataTypes.INTEGER },
  due_date: { type: DataTypes.DATEONLY },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'tasks', timestamps: false });
