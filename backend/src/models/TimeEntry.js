const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TimeEntry extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  }
}

TimeEntry.init(
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
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    startTime: {
      type: DataTypes.DATE,
    },
    endTime: {
      type: DataTypes.DATE,
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Duration in seconds',
    },
    isBillable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    source: {
      type: DataTypes.ENUM('timer', 'manual'),
      defaultValue: 'manual',
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'TimeEntry',
    tableName: 'time_entries',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = TimeEntry;
