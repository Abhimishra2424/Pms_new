const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class BugReport extends Model {
  static associate(models) {
    this.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
  }
}

BugReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    severity: {
      type: DataTypes.ENUM('critical', 'major', 'minor', 'trivial'),
      defaultValue: 'minor',
    },
    environment: {
      type: DataTypes.TEXT,
    },
    browser: {
      type: DataTypes.STRING,
    },
    os: {
      type: DataTypes.STRING,
    },
    stepsToReproduce: {
      type: DataTypes.TEXT,
    },
    expectedResult: {
      type: DataTypes.TEXT,
    },
    actualResult: {
      type: DataTypes.TEXT,
    },
    screenshots: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'BugReport',
    tableName: 'bug_reports',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = BugReport;
