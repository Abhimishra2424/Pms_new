const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TaskHistory extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

TaskHistory.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    field: {
      type: DataTypes.STRING,
    },
    oldValue: {
      type: DataTypes.TEXT,
    },
    newValue: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM(
        'update',
        'create',
        'comment',
        'status_change',
        'assignee_change',
        'attachment'
      ),
      defaultValue: 'update',
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'TaskHistory',
    tableName: 'task_histories',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = TaskHistory;
