const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Wiki extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
    this.belongsTo(models.Wiki, { foreignKey: 'parentId', as: 'parent' });
  }
}

Wiki.init(
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
    },
    content: {
      type: DataTypes.TEXT,
    },
    parentId: {
      type: DataTypes.UUID,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Wiki',
    tableName: 'wikis',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Wiki;
