const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Invoice extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
    this.hasMany(models.InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
  }
}

Invoice.init(
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
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'),
      defaultValue: 'draft',
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
    },
    discountValue: {
      type: DataTypes.DECIMAL(12, 2),
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    amountPaid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    balanceDue: {
      type: DataTypes.DECIMAL(12, 2),
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    terms: {
      type: DataTypes.TEXT,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Invoice;
