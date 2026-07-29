const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { TimeEntry, Task, Project, User } = require('../models');

const TimeEntryRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', userId, taskId, projectId, startDate, endDate, isBillable } = query;

    const where = {};
    if (userId) where.userId = userId;
    if (taskId) where.taskId = taskId;
    if (projectId) where.projectId = projectId;
    if (isBillable !== undefined && isBillable !== null) where.isBillable = isBillable === 'true' || isBillable === true;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const allowedSortFields = ['createdAt', 'startTime', 'endTime', 'duration', 'date'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: entries } = await TimeEntry.findAndCountAll({
      where,
      include: [
        { model: Task, as: 'task', attributes: ['id', 'title', 'status'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { entries, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return TimeEntry.findByPk(id, {
      include: [
        { model: Task, as: 'task', attributes: ['id', 'title', 'status'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
    });
  },

  async findActiveTimer(userId) {
    return TimeEntry.findOne({
      where: { userId, endTime: null, source: 'timer' },
      include: [
        { model: Task, as: 'task', attributes: ['id', 'title', 'status'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
      ],
    });
  },

  async findByTaskId(taskId) {
    return TimeEntry.findAll({
      where: { taskId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
      order: [['startTime', 'DESC']],
    });
  },

  async findByUserIdAndDateRange(userId, startDate, endDate) {
    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }
    return TimeEntry.findAll({
      where,
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });
  },

  async getDailyTotal(userId, date) {
    const result = await TimeEntry.findAll({
      where: { userId, date },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('duration')), 0), 'totalSeconds'],
      ],
      raw: true,
    });
    return parseInt(result[0]?.totalSeconds || 0, 10);
  },

  async create(data) {
    return TimeEntry.create(data);
  },

  async update(id, data) {
    const entry = await TimeEntry.findByPk(id, { paranoid: false });
    if (!entry) return null;
    await entry.update(data);
    return entry;
  },

  async delete(id) {
    const entry = await TimeEntry.findByPk(id, { paranoid: false });
    if (!entry) return false;
    await entry.destroy();
    return true;
  },
};

module.exports = TimeEntryRepository;
