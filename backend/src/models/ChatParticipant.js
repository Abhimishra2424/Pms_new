const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ChatParticipant extends Model {
  static associate(models) {
    this.belongsTo(models.ChatConversation, { foreignKey: 'conversationId', as: 'conversation' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

ChatParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lastReadAt: {
      type: DataTypes.DATE,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ChatParticipant',
    tableName: 'chat_participants',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['conversationId', 'userId'] },
    ],
  }
);

module.exports = ChatParticipant;
