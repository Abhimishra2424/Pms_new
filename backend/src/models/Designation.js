const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Designation extends Model {
  static associate(models) {
    this.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
  }
}

Designation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    departmentId: {
      type: DataTypes.UUID,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hierarchyLevel: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Designation',
    tableName: 'designations',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Designation;
