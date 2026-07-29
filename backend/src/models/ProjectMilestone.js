const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ProjectMilestone extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  }
}

ProjectMilestone.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    completedDate: {
      type: DataTypes.DATE,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ProjectMilestone',
    tableName: 'project_milestones',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProjectMilestone;
