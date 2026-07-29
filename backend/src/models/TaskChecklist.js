const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TaskChecklist extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    this.belongsTo(models.User, { foreignKey: 'completedBy', as: 'completedByUser' });
  }
}

TaskChecklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedBy: {
      type: DataTypes.UUID,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'TaskChecklist',
    tableName: 'task_checklists',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = TaskChecklist;
