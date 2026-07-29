const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Project extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
    this.belongsTo(models.User, { foreignKey: 'leadId', as: 'lead' });
    this.hasMany(models.ProjectMember, { foreignKey: 'projectId', as: 'members' });
    this.hasMany(models.Task, { foreignKey: 'projectId', as: 'tasks' });
    this.hasMany(models.Sprint, { foreignKey: 'projectId', as: 'sprints' });
    this.hasMany(models.Epic, { foreignKey: 'projectId', as: 'epics' });
    this.hasMany(models.ProjectMilestone, { foreignKey: 'projectId', as: 'milestones' });
    this.hasMany(models.Meeting, { foreignKey: 'projectId', as: 'meetings' });
    this.hasMany(models.Expense, { foreignKey: 'projectId', as: 'expenses' });
    this.hasMany(models.Document, { foreignKey: 'projectId', as: 'documents' });
  }
}

Project.init(
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
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        'planning',
        'in_progress',
        'on_hold',
        'completed',
        'cancelled',
        'archived'
      ),
      defaultValue: 'planning',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    category: {
      type: DataTypes.ENUM(
        'software',
        'marketing',
        'design',
        'research',
        'operations',
        'other'
      ),
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
    },
    leadId: {
      type: DataTypes.UUID,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(10, 2),
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    budget: {
      type: DataTypes.DECIMAL(12, 2),
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.JSON,
    },
    attachments: {
      type: DataTypes.JSON,
    },
    metadata: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Project;
