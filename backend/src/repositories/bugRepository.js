const { Op } = require('sequelize');
const { BugReport, Task, User } = require('../models');

const BugRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', severity, status, projectId, assigneeId } = query;

    const where = {};
    if (severity) where.severity = severity;

    const taskWhere = {};
    if (status) taskWhere.status = status;
    if (projectId) taskWhere.projectId = projectId;
    if (assigneeId) taskWhere.assigneeId = assigneeId;

    const allowedSortFields = ['createdAt', 'severity', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: bugs } = await BugReport.findAndCountAll({
      where,
      include: [
        {
          model: Task,
          as: 'task',
          where: Object.keys(taskWhere).length > 0 ? taskWhere : undefined,
          attributes: ['id', 'title', 'status', 'type', 'projectId', 'assigneeId', 'priority'],
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
          ],
        },
      ],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { bugs, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return BugReport.findByPk(id, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'status', 'type', 'projectId', 'assigneeId', 'priority'],
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
          ],
        },
      ],
    });
  },

  async findByTaskId(taskId) {
    return BugReport.findOne({
      where: { taskId },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'status', 'type', 'projectId', 'assigneeId', 'priority'],
        },
      ],
    });
  },

  async create(data) {
    return BugReport.create(data);
  },

  async update(id, data) {
    const bug = await BugReport.findByPk(id, { paranoid: false });
    if (!bug) return null;
    await bug.update(data);
    return bug;
  },

  async delete(id) {
    const bug = await BugReport.findByPk(id, { paranoid: false });
    if (!bug) return false;
    await bug.destroy();
    return true;
  },
};

module.exports = BugRepository;
