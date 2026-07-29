const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Expense extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  }
}

Expense.init(
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
    projectId: {
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('travel', 'office_supplies', 'software', 'hardware', 'utilities', 'meals', 'entertainment', 'other'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    expenseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    receipt: {
      type: DataTypes.JSON,
    },
    isBillable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    approvedBy: {
      type: DataTypes.UUID,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Expense',
    tableName: 'expenses',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Expense;
