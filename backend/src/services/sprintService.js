const { Op } = require('sequelize');
const { Project, Sprint, Task } = require('../models');
const ApiError = require('../utils/ApiError');
const SprintRepository = require('../repositories/sprintRepository');

const SprintService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      status: query.status,
    };
    return SprintRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const sprint = await SprintRepository.findById(id);
    if (!sprint) {
      throw ApiError.notFound('Sprint not found');
    }
    return sprint;
  },

  async create(data) {
    const project = await Project.findByPk(data.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }
    return SprintRepository.create(data);
  },

  async update(id, data) {
    const sprint = await this.getById(id);
    if (data.projectId && data.projectId !== sprint.projectId) {
      const project = await Project.findByPk(data.projectId);
      if (!project) {
        throw ApiError.badRequest('Project not found');
      }
    }

    if (data.status === 'active') {
      const activeSprint = await Sprint.findOne({
        where: { projectId: sprint.projectId, status: 'active', id: { [Op.ne]: id } },
      });
      if (activeSprint) {
        throw ApiError.badRequest('Another sprint is already active for this project');
      }
    }

    const updated = await SprintRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Sprint not found');
    }
    return updated;
  },

  async delete(id) {
    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      throw ApiError.notFound('Sprint not found');
    }
    await SprintRepository.delete(id);
    return true;
  },

  async startSprint(id) {
    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      throw ApiError.notFound('Sprint not found');
    }

    if (sprint.status !== 'planning') {
      throw ApiError.badRequest('Only sprints in planning status can be started');
    }

    const activeSprint = await Sprint.findOne({
      where: { projectId: sprint.projectId, status: 'active', id: { [Op.ne]: id } },
    });
    if (activeSprint) {
      throw ApiError.badRequest('Another sprint is already active for this project');
    }

    await sprint.update({ status: 'active', startDate: sprint.startDate || new Date() });
    return SprintRepository.findById(id);
  },

  async completeSprint(id) {
    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      throw ApiError.notFound('Sprint not found');
    }

    if (sprint.status !== 'active') {
      throw ApiError.badRequest('Only active sprints can be completed');
    }

    const totalStoryPoints = await Task.sum('storyPoints', { where: { sprintId: id } });
    const completedStoryPoints = await Task.sum('storyPoints', { where: { sprintId: id, status: 'done' } });

    await sprint.update({
      status: 'completed',
      completedDate: new Date(),
      totalStoryPoints: totalStoryPoints || 0,
      completedStoryPoints: completedStoryPoints || 0,
    });

    return SprintRepository.findById(id);
  },

  async getSprintReport(id) {
    const sprint = await this.getById(id);

    const tasksByStatus = await Task.findAll({
      where: { sprintId: id },
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const tasksByAssignee = await Task.findAll({
      where: { sprintId: id },
      attributes: ['assigneeId', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['assigneeId'],
      raw: true,
    });

    return {
      sprint,
      tasksByStatus,
      tasksByAssignee,
    };
  },
};

module.exports = SprintService;
