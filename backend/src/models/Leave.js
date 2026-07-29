const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Leave extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  }
}

Leave.init(
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
    type: {
      type: DataTypes.ENUM('annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.INTEGER,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending',
    },
    approvedBy: {
      type: DataTypes.UUID,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
    },
    attachments: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Leave',
    tableName: 'leaves',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Leave;
