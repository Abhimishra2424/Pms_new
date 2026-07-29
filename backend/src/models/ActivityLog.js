const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ActivityLog extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.UUID,
    },
    description: {
      type: DataTypes.TEXT,
    },
    metadata: {
      type: DataTypes.JSON,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    userAgent: {
      type: DataTypes.STRING,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['companyId', 'resourceType', 'resourceId'] },
    ],
  }
);

module.exports = ActivityLog;
