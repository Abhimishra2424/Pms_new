const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class MeetingAttendee extends Model {
  static associate(models) {
    this.belongsTo(models.Meeting, { foreignKey: 'meetingId', as: 'meeting' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

MeetingAttendee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    meetingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined', 'tentative'),
      defaultValue: 'pending',
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'MeetingAttendee',
    tableName: 'meeting_attendees',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['meetingId', 'userId'] },
    ],
  }
);

module.exports = MeetingAttendee;
