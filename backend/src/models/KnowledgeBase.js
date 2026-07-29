const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class KnowledgeBase extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  }
}

KnowledgeBase.init(
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
    projectId: {
      type: DataTypes.UUID,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    excerpt: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.JSON,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'KnowledgeBase',
    tableName: 'knowledge_bases',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = KnowledgeBase;
