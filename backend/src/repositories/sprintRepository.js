const { Op } = require('sequelize');
const { Sprint, Project, Task } = require('../models');

const sprintIncludes = [
  { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
];

const SprintRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', projectId, status } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const allowedSortFields = ['createdAt', 'name', 'startDate', 'endDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: sprints } = await Sprint.findAndCountAll({
      where,
      include: sprintIncludes,
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    const sprintsWithTaskCounts = await Promise.all(
      sprints.map(async (sprint) => {
        const taskCount = await Task.count({ where: { sprintId: sprint.id } });
        const completedTasks = await Task.count({ where: { sprintId: sprint.id, status: 'done' } });
        const totalStoryPoints = await Task.sum('storyPoints', { where: { sprintId: sprint.id } });
        const completedStoryPoints = await Task.sum('storyPoints', { where: { sprintId: sprint.id, status: 'done' } });
        return {
          ...sprint.toJSON(),
          taskCount,
          completedTasks,
          totalStoryPoints: totalStoryPoints || 0,
          completedStoryPoints: completedStoryPoints || 0,
        };
      })
    );

    return { sprints: sprintsWithTaskCounts, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    const sprint = await Sprint.findByPk(id, { include: sprintIncludes });
    if (!sprint) return null;

    const taskCount = await Task.count({ where: { sprintId: sprint.id } });
    const completedTasks = await Task.count({ where: { sprintId: sprint.id, status: 'done' } });
    const totalStoryPoints = await Task.sum('storyPoints', { where: { sprintId: sprint.id } });
    const completedStoryPoints = await Task.sum('storyPoints', { where: { sprintId: sprint.id, status: 'done' } });

    return {
      ...sprint.toJSON(),
      taskCount,
      completedTasks,
      totalStoryPoints: totalStoryPoints || 0,
      completedStoryPoints: completedStoryPoints || 0,
    };
  },

  async create(data) {
    return Sprint.create(data);
  },

  async update(id, data) {
    const sprint = await Sprint.findByPk(id, { paranoid: false });
    if (!sprint) return null;
    await sprint.update(data);
    return sprint;
  },

  async delete(id) {
    const sprint = await Sprint.findByPk(id, { paranoid: false });
    if (!sprint) return false;
    await sprint.destroy();
    return true;
  },
};

module.exports = SprintRepository;
