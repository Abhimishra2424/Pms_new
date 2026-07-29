const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Meeting extends Model {
  static associate(models) {
    this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    this.belongsTo(models.User, { foreignKey: 'createdBy', as: 'createdByUser' });
    this.hasMany(models.MeetingAttendee, { foreignKey: 'meetingId', as: 'attendees' });
  }
}

Meeting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    projectId: {
      type: DataTypes.UUID,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    meetingDate: {
      type: DataTypes.DATE,
    },
    startTime: {
      type: DataTypes.TIME,
    },
    endTime: {
      type: DataTypes.TIME,
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Duration in minutes',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled', 'rescheduled'),
      defaultValue: 'scheduled',
    },
    meetingLink: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    recordingUrl: {
      type: DataTypes.STRING,
    },
    attachments: {
      type: DataTypes.JSON,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Meeting',
    tableName: 'meetings',
    paranoid: true,
    timestamps: true,
    underscored: true,
  }
);

module.exports = Meeting;
