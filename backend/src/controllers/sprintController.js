const SprintService = require('../services/sprintService');
const ApiResponse = require('../utils/ApiResponse');

const sprintController = {
  async getAll(req, res, next) {
    try {
      const result = await SprintService.getAll(req.query);
      return ApiResponse.success(res, {
        sprints: result.sprints,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Sprints fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const sprint = await SprintService.getById(req.params.id);
      return ApiResponse.success(res, { sprint }, 'Sprint fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const sprint = await SprintService.create(req.body);
      return ApiResponse.success(res, { sprint }, 'Sprint created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const sprint = await SprintService.update(req.params.id, req.body);
      return ApiResponse.success(res, { sprint }, 'Sprint updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await SprintService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Sprint deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async startSprint(req, res, next) {
    try {
      const sprint = await SprintService.startSprint(req.params.id);
      return ApiResponse.success(res, { sprint }, 'Sprint started successfully');
    } catch (error) {
      next(error);
    }
  },

  async completeSprint(req, res, next) {
    try {
      const sprint = await SprintService.completeSprint(req.params.id);
      return ApiResponse.success(res, { sprint }, 'Sprint completed successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSprintReport(req, res, next) {
    try {
      const report = await SprintService.getSprintReport(req.params.id);
      return ApiResponse.success(res, { report }, 'Sprint report fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = sprintController;
