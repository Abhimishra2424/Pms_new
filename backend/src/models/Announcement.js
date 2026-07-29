const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Announcement extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  }
}

Announcement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    targetAudience: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Announcement',
    tableName: 'announcements',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Announcement;
