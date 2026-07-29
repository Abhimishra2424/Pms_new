const { Op } = require('sequelize');
const { Meeting, MeetingAttendee, User, Project } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const MeetingRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      projectId, createdBy, status, meetingDateFrom, meetingDateTo, companyId,
    } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (createdBy) where.createdBy = createdBy;
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    if (meetingDateFrom || meetingDateTo) {
      where.meetingDate = {};
      if (meetingDateFrom) where.meetingDate[Op.gte] = new Date(meetingDateFrom);
      if (meetingDateTo) where.meetingDate[Op.lte] = new Date(meetingDateTo);
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'meetingDate', 'startTime', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: meetings } = await Meeting.findAndCountAll({
      where,
      include: [
        { model: User, as: 'createdByUser', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        {
          model: MeetingAttendee,
          as: 'attendees',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { meetings, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    const meeting = await Meeting.findByPk(id, {
      include: [
        { model: User, as: 'createdByUser', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        {
          model: MeetingAttendee,
          as: 'attendees',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
    });
    return meeting;
  },

  async findByProject(projectId) {
    return Meeting.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'createdByUser', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        {
          model: MeetingAttendee,
          as: 'attendees',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
        },
      ],
      order: [['meetingDate', 'DESC'], ['startTime', 'ASC']],
    });
  },

  async create(data, options) {
    return Meeting.create(data, options);
  },

  async update(id, data, options) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return null;
    await meeting.update(data, options);
    return meeting;
  },

  async delete(id, options) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return false;
    await meeting.destroy(options);
    return true;
  },

  async createAttendees(attendeeData, options) {
    return MeetingAttendee.bulkCreate(attendeeData, options);
  },

  async removeAttendees(meetingId, userIds, options) {
    return MeetingAttendee.destroy({
      where: { meetingId, userId: { [Op.in]: userIds } },
      ...options,
    });
  },

  async findAttendeesByMeeting(meetingId) {
    return MeetingAttendee.findAll({
      where: { meetingId },
      include: [{ model: User, as: 'user', attributes: userAttributes }],
    });
  },
};

module.exports = MeetingRepository;
