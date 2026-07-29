const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('ProjectMember', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
}, { tableName: 'project_members', timestamps: false });
