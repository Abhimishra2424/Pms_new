const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {
  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });
    this.belongsTo(models.Document, { foreignKey: 'folderId', as: 'parent' });
  }
}

Document.init(
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
    folderId: {
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    fileUrl: {
      type: DataTypes.STRING,
    },
    fileType: {
      type: DataTypes.STRING,
    },
    fileSize: {
      type: DataTypes.INTEGER,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Document;
