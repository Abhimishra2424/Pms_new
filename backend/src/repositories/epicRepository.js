const { Op } = require('sequelize');
const { Epic, Project, Task } = require('../models');

const EpicRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', projectId, status, priority } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const allowedSortFields = ['createdAt', 'name', 'status', 'priority', 'startDate', 'endDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: epics } = await Epic.findAndCountAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'key'] }],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    const epicsWithTaskCounts = await Promise.all(
      epics.map(async (epic) => {
        const taskCount = await Task.count({ where: { epicId: epic.id } });
        const completedTasks = await Task.count({ where: { epicId: epic.id, status: 'done' } });
        return { ...epic.toJSON(), taskCount, completedTasks };
      })
    );

    return { epics: epicsWithTaskCounts, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    const epic = await Epic.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'key'] }],
    });
    if (!epic) return null;

    const taskCount = await Task.count({ where: { epicId: epic.id } });
    const completedTasks = await Task.count({ where: { epicId: epic.id, status: 'done' } });
    return { ...epic.toJSON(), taskCount, completedTasks };
  },

  async create(data) {
    return Epic.create(data);
  },

  async update(id, data) {
    const epic = await Epic.findByPk(id, { paranoid: false });
    if (!epic) return null;
    await epic.update(data);
    return epic;
  },

  async delete(id) {
    const epic = await Epic.findByPk(id, { paranoid: false });
    if (!epic) return false;
    await epic.destroy();
    return true;
  },
};

module.exports = EpicRepository;
