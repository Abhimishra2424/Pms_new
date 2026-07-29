const BugService = require('../services/bugService');
const ApiResponse = require('../utils/ApiResponse');

const bugController = {
  async getAll(req, res, next) {
    try {
      const result = await BugService.getAll(req.query);
      return ApiResponse.success(res, {
        bugs: result.bugs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Bugs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const bug = await BugService.getById(req.params.id);
      return ApiResponse.success(res, { bug }, 'Bug fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const bug = await BugService.create(req.body);
      return ApiResponse.success(res, { bug }, 'Bug report created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const bug = await BugService.update(req.params.id, req.body);
      return ApiResponse.success(res, { bug }, 'Bug report updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await BugService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Bug report deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByProject(req, res, next) {
    try {
      const bugs = await BugService.getByProject(req.params.projectId);
      return ApiResponse.success(res, { bugs }, 'Bugs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByAssignee(req, res, next) {
    try {
      const bugs = await BugService.getByAssignee(req.params.assigneeId);
      return ApiResponse.success(res, { bugs }, 'Bugs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getBySeverity(req, res, next) {
    try {
      const bugs = await BugService.getBySeverity(req.params.severity);
      return ApiResponse.success(res, { bugs }, 'Bugs fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bugController;
