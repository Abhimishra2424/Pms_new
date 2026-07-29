const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Department extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.User, { foreignKey: 'headId', as: 'head' });
    this.hasMany(models.User, { foreignKey: 'departmentId', as: 'users' });
    this.hasMany(models.Designation, { foreignKey: 'departmentId', as: 'designations' });
  }
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    headId: {
      type: DataTypes.UUID,
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
    modelName: 'Department',
    tableName: 'departments',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['name', 'companyId'] },
    ],
  }
);

module.exports = Department;
