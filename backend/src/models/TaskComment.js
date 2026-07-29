const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TaskComment extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

TaskComment.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mentions: {
      type: DataTypes.JSON,
    },
    attachments: {
      type: DataTypes.JSON,
    },
    editedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'TaskComment',
    tableName: 'task_comments',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = TaskComment;
