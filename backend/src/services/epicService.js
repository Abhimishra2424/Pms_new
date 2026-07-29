const { Project, Epic } = require('../models');
const ApiError = require('../utils/ApiError');
const EpicRepository = require('../repositories/epicRepository');

const EpicService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      status: query.status,
      priority: query.priority,
    };
    return EpicRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const epic = await EpicRepository.findById(id);
    if (!epic) {
      throw ApiError.notFound('Epic not found');
    }
    return epic;
  },

  async create(data) {
    const project = await Project.findByPk(data.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }
    return EpicRepository.create(data);
  },

  async update(id, data) {
    const epic = await this.getById(id);
    if (data.projectId && data.projectId !== epic.projectId) {
      const project = await Project.findByPk(data.projectId);
      if (!project) {
        throw ApiError.badRequest('Project not found');
      }
    }
    const updated = await EpicRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Epic not found');
    }
    return updated;
  },

  async delete(id) {
    const epic = await Epic.findByPk(id);
    if (!epic) {
      throw ApiError.notFound('Epic not found');
    }
    await EpicRepository.delete(id);
    return true;
  },
};

module.exports = EpicService;
