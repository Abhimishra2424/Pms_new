const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatMessage extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    this.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.ChatConversation, { foreignKey: 'conversationId', as: 'conversation' });
  }
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.UUID,
    },
    projectId: {
      type: DataTypes.UUID,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file', 'voice', 'system'),
      defaultValue: 'text',
    },
    attachments: {
      type: DataTypes.JSON,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
    },
    editedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = ChatMessage;
