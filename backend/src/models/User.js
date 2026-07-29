const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    this.belongsTo(models.Designation, { foreignKey: 'designationId', as: 'designation' });
    this.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
    this.hasMany(models.User, { foreignKey: 'managerId', as: 'subordinates' });
    this.hasMany(models.Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
    this.hasMany(models.Task, { foreignKey: 'reporterId', as: 'reportedTasks' });
    this.hasMany(models.TaskComment, { foreignKey: 'userId', as: 'comments' });
    this.hasMany(models.TaskHistory, { foreignKey: 'userId', as: 'taskHistories' });
    this.hasMany(models.TimeEntry, { foreignKey: 'userId', as: 'timeEntries' });
    this.hasMany(models.Attendance, { foreignKey: 'userId', as: 'attendances' });
    this.hasMany(models.Leave, { foreignKey: 'userId', as: 'leaves' });
    this.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    this.hasMany(models.ChatMessage, { foreignKey: 'senderId', as: 'sentMessages' });
    this.hasMany(models.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
    this.hasMany(models.Expense, { foreignKey: 'userId', as: 'expenses' });
    this.hasMany(models.Document, { foreignKey: 'uploadedBy', as: 'documents' });
    this.hasMany(models.Project, { foreignKey: 'leadId', as: 'leadedProjects' });
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM(
        'super_admin',
        'company_admin',
        'project_manager',
        'team_lead',
        'developer',
        'qa',
        'hr',
        'client'
      ),
      defaultValue: 'developer',
    },
    departmentId: {
      type: DataTypes.UUID,
    },
    designationId: {
      type: DataTypes.UUID,
    },
    companyId: {
      type: DataTypes.UUID,
    },
    managerId: {
      type: DataTypes.UUID,
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
    },
    dateOfJoining: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
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
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    emailVerified: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    paranoid: true,
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
