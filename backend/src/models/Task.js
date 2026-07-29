const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.Sprint, { foreignKey: 'sprintId', as: 'sprint' });
    this.belongsTo(models.Epic, { foreignKey: 'epicId', as: 'epic' });
    this.belongsTo(models.ProjectMilestone, { foreignKey: 'milestoneId', as: 'milestone' });
    this.belongsTo(models.User, { foreignKey: 'reporterId', as: 'reporter' });
    this.belongsTo(models.User, { foreignKey: 'assigneeId', as: 'assignee' });
    this.belongsTo(models.Task, { foreignKey: 'parentId', as: 'parent' });
    this.hasMany(models.Task, { foreignKey: 'parentId', as: 'children' });
    this.hasMany(models.TaskChecklist, { foreignKey: 'taskId', as: 'checklists' });
    this.hasMany(models.TaskDependency, { foreignKey: 'taskId', as: 'dependencies' });
    this.hasMany(models.TaskComment, { foreignKey: 'taskId', as: 'comments' });
    this.hasMany(models.TaskHistory, { foreignKey: 'taskId', as: 'histories' });
    this.hasMany(models.BugReport, { foreignKey: 'taskId', as: 'bugReport' });
    this.hasMany(models.TimeEntry, { foreignKey: 'taskId', as: 'timeEntries' });
    this.belongsToMany(models.Task, {
      through: models.TaskDependency,
      foreignKey: 'taskId',
      otherKey: 'dependsOnId',
      as: 'dependsOn',
    });
  }
}

Task.init(
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
    type: {
      type: DataTypes.ENUM('task', 'bug', 'story', 'epic', 'sub_task'),
      defaultValue: 'task',
    },
    status: {
      type: DataTypes.ENUM(
        'backlog',
        'todo',
        'in_progress',
        'in_review',
        'done',
        'cancelled'
      ),
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    severity: {
      type: DataTypes.ENUM('critical', 'major', 'minor', 'trivial'),
    },
    storyPoints: {
      type: DataTypes.INTEGER,
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(10, 2),
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    completedDate: {
      type: DataTypes.DATE,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sprintId: {
      type: DataTypes.UUID,
    },
    epicId: {
      type: DataTypes.UUID,
    },
    milestoneId: {
      type: DataTypes.UUID,
    },
    parentId: {
      type: DataTypes.UUID,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assigneeId: {
      type: DataTypes.UUID,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    labels: {
      type: DataTypes.JSON,
    },
    attachments: {
      type: DataTypes.JSON,
    },
    environment: {
      type: DataTypes.TEXT,
    },
    stepsToReproduce: {
      type: DataTypes.TEXT,
    },
    expectedResult: {
      type: DataTypes.TEXT,
    },
    actualResult: {
      type: DataTypes.TEXT,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['projectId', 'status'] },
      { fields: ['assigneeId'] },
      { fields: ['sprintId'] },
      { fields: ['parentId'] },
    ],
  }
);

module.exports = Task;
