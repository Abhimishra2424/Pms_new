const ProjectService = require('../services/projectService');
const ApiResponse = require('../utils/ApiResponse');

const projectController = {
  async getAll(req, res, next) {
    try {
      const result = await ProjectService.getAll(req.query);
      return ApiResponse.success(res, {
        projects: result.projects,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Projects fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await ProjectService.getById(req.params.id);
      return ApiResponse.success(res, { project }, 'Project fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const project = await ProjectService.create(req.body);
      return ApiResponse.success(res, { project }, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      return ApiResponse.success(res, { project }, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ProjectService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await ProjectService.getStats(req.params.id);
      return ApiResponse.success(res, { stats }, 'Project stats fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getTimeline(req, res, next) {
    try {
      const timeline = await ProjectService.getTimeline(req.params.id);
      return ApiResponse.success(res, { timeline }, 'Project timeline fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = projectController;
