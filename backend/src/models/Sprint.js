const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Sprint extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.hasMany(models.Task, { foreignKey: 'sprintId', as: 'tasks' });
  }
}

Sprint.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goal: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'cancelled'),
      defaultValue: 'planning',
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    completedDate: {
      type: DataTypes.DATE,
    },
    totalStoryPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completedStoryPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Sprint',
    tableName: 'sprints',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['projectId', 'status'] },
    ],
  }
);

module.exports = Sprint;
