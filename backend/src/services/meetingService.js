const { Meeting, MeetingAttendee, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const MeetingRepository = require('../repositories/meetingRepository');
const Helpers = require('../utils/helpers');

const MeetingService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      createdBy: query.createdBy,
      status: query.status,
      meetingDateFrom: query.meetingDateFrom,
      meetingDateTo: query.meetingDateTo,
      companyId: query.companyId || query.companyId,
    };
    return MeetingRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const meeting = await MeetingRepository.findById(id);
    if (!meeting) {
      throw ApiError.notFound('Meeting not found');
    }
    return meeting;
  },

  async create(data, userId) {
    const { attendeeIds, ...meetingData } = data;

    if (meetingData.startTime && meetingData.endTime && meetingData.startTime >= meetingData.endTime) {
      throw ApiError.badRequest('End time must be after start time');
    }

    if (!meetingData.meetingLink) {
      meetingData.meetingLink = this._generateMeetingLink();
    }

    const transaction = await sequelize.transaction();
    try {
      const meeting = await MeetingRepository.create(
        { ...meetingData, createdBy: userId },
        { transaction }
      );

      if (attendeeIds && attendeeIds.length > 0) {
        const attendeeRecords = attendeeIds.map((userId) => ({
          meetingId: meeting.id,
          userId,
        }));
        await MeetingRepository.createAttendees(attendeeRecords, { transaction });
      }

      await transaction.commit();
      return MeetingRepository.findById(meeting.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async update(id, data, userId) {
    const meeting = await this.getById(id);

    const { attendeeIds, ...meetingData } = data;

    if (meetingData.startTime && meetingData.endTime && meetingData.startTime >= meetingData.endTime) {
      throw ApiError.badRequest('End time must be after start time');
    }

    const transaction = await sequelize.transaction();
    try {
      const updated = await MeetingRepository.update(id, meetingData, { transaction });

      if (attendeeIds !== undefined) {
        const currentAttendees = await MeetingRepository.findAttendeesByMeeting(id);
        const currentUserIds = currentAttendees.map((a) => a.userId);

        const toAdd = attendeeIds.filter((uid) => !currentUserIds.includes(uid));
        const toRemove = currentUserIds.filter((uid) => !attendeeIds.includes(uid));

        if (toRemove.length > 0) {
          await MeetingRepository.removeAttendees(id, toRemove, { transaction });
        }

        if (toAdd.length > 0) {
          const attendeeRecords = toAdd.map((uid) => ({
            meetingId: id,
            userId: uid,
          }));
          await MeetingRepository.createAttendees(attendeeRecords, { transaction });
        }
      }

      await transaction.commit();
      return MeetingRepository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async delete(id) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      throw ApiError.notFound('Meeting not found');
    }
    return MeetingRepository.delete(id);
  },

  async getByProject(projectId) {
    return MeetingRepository.findByProject(projectId);
  },

  _generateMeetingLink() {
    const uuid = require('uuid').v4();
    return `https://meet.example.com/${uuid}`;
  },
};

module.exports = MeetingService;
