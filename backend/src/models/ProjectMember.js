const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ProjectMember extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

ProjectMember.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('manager', 'lead', 'member', 'viewer'),
      defaultValue: 'member',
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    totalHours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProjectMember;
