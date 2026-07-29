const { Op } = require('sequelize');
const { ProjectMilestone, Project } = require('../models');

const MilestoneRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', projectId, status } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const allowedSortFields = ['createdAt', 'title', 'dueDate', 'sortOrder'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: milestones } = await ProjectMilestone.findAndCountAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'key'] }],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { milestones, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return ProjectMilestone.findByPk(id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'key'] }],
    });
  },

  async create(data) {
    return ProjectMilestone.create(data);
  },

  async update(id, data) {
    const milestone = await ProjectMilestone.findByPk(id, { paranoid: false });
    if (!milestone) return null;
    await milestone.update(data);
    return milestone;
  },

  async delete(id) {
    const milestone = await ProjectMilestone.findByPk(id, { paranoid: false });
    if (!milestone) return false;
    await milestone.destroy();
    return true;
  },
};

module.exports = MilestoneRepository;
