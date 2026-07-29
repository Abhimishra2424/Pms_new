const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TaskDependency extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    this.belongsTo(models.Task, { foreignKey: 'dependsOnId', as: 'dependsOn' });
  }
}

TaskDependency.init(
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
    dependsOnId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('blocks', 'blocked_by', 'relates_to'),
      defaultValue: 'relates_to',
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'TaskDependency',
    tableName: 'task_dependencies',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = TaskDependency;
