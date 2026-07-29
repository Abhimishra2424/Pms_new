const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Attendance extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
  }
}

Attendance.init(
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
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clockIn: {
      type: DataTypes.DATE,
    },
    clockOut: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'holiday', 'on_leave'),
      defaultValue: 'present',
    },
    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendances',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['userId', 'date'] },
    ],
  }
);

module.exports = Attendance;
