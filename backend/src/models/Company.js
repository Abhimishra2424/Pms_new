const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Company extends Model {
  static associate(models) {
    this.hasMany(models.User, { foreignKey: 'companyId', as: 'users' });
    this.hasMany(models.Department, { foreignKey: 'companyId', as: 'departments' });
    this.hasMany(models.Designation, { foreignKey: 'companyId', as: 'designations' });
    this.hasMany(models.Project, { foreignKey: 'companyId', as: 'projects' });
    this.hasMany(models.Client, { foreignKey: 'companyId', as: 'clients' });
    this.hasMany(models.Invoice, { foreignKey: 'companyId', as: 'invoices' });
    this.hasMany(models.Expense, { foreignKey: 'companyId', as: 'expenses' });
    this.hasMany(models.Document, { foreignKey: 'companyId', as: 'documents' });
    this.hasMany(models.KnowledgeBase, { foreignKey: 'companyId', as: 'knowledgeBases' });
    this.hasMany(models.Wiki, { foreignKey: 'companyId', as: 'wikis' });
    this.hasMany(models.Announcement, { foreignKey: 'companyId', as: 'announcements' });
    this.hasMany(models.ActivityLog, { foreignKey: 'companyId', as: 'activityLogs' });
    this.hasMany(models.Setting, { foreignKey: 'companyId', as: 'settings' });
    this.hasMany(models.Holiday, { foreignKey: 'companyId', as: 'holidays' });
    this.hasMany(models.Attendance, { foreignKey: 'companyId', as: 'attendances' });
    this.hasMany(models.Leave, { foreignKey: 'companyId', as: 'leaves' });
    this.hasMany(models.Notification, { foreignKey: 'companyId', as: 'notifications' });
  }
}

Company.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.STRING,
    },
    taxId: {
      type: DataTypes.STRING,
    },
    registrationNumber: {
      type: DataTypes.STRING,
    },
    industry: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-1000', '1000+'),
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    dateFormat: {
      type: DataTypes.STRING,
      defaultValue: 'YYYY-MM-DD',
    },
    timeFormat: {
      type: DataTypes.STRING,
      defaultValue: '24h',
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
    modelName: 'Company',
    tableName: 'companies',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Company;
