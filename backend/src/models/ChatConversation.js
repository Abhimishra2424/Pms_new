const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatConversation extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'createdBy', as: 'createdByUser' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.hasMany(models.ChatParticipant, { foreignKey: 'conversationId', as: 'participants' });
    this.hasMany(models.ChatMessage, { foreignKey: 'conversationId', as: 'messages' });
  }
}

ChatConversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM('direct', 'group', 'project'),
      allowNull: false,
      defaultValue: 'direct',
    },
    projectId: {
      type: DataTypes.UUID,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ChatConversation',
    tableName: 'chat_conversations',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = ChatConversation;
