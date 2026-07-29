const { Project, ProjectMilestone } = require('../models');
const ApiError = require('../utils/ApiError');
const MilestoneRepository = require('../repositories/milestoneRepository');

const MilestoneService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      status: query.status,
    };
    return MilestoneRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const milestone = await MilestoneRepository.findById(id);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }
    return milestone;
  },

  async create(data) {
    const project = await Project.findByPk(data.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }
    return MilestoneRepository.create(data);
  },

  async update(id, data) {
    const milestone = await this.getById(id);
    if (data.projectId && data.projectId !== milestone.projectId) {
      const project = await Project.findByPk(data.projectId);
      if (!project) {
        throw ApiError.badRequest('Project not found');
      }
    }
    const updated = await MilestoneRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Milestone not found');
    }
    return updated;
  },

  async delete(id) {
    const milestone = await ProjectMilestone.findByPk(id);
    if (!milestone) {
      throw ApiError.notFound('Milestone not found');
    }
    await MilestoneRepository.delete(id);
    return true;
  },
};

module.exports = MilestoneService;
