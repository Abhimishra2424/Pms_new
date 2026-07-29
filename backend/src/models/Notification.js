const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM(
        'task_assigned',
        'task_updated',
        'comment',
        'mention',
        'project_update',
        'status_change',
        'deadline',
        'meeting',
        'leave',
        'approval',
        'system'
      ),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.STRING,
    },
    referenceType: {
      type: DataTypes.STRING,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Notification;
