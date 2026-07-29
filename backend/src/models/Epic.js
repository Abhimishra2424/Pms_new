const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Epic extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.hasMany(models.Task, { foreignKey: 'epicId', as: 'tasks' });
  }
}

Epic.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
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
    modelName: 'Epic',
    tableName: 'epics',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Epic;
