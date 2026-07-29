const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class InvoiceItem extends Model {
  static associate(models) {
    this.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
  }
}

InvoiceItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice_items',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = InvoiceItem;
