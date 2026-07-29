const MilestoneService = require('../services/milestoneService');
const ApiResponse = require('../utils/ApiResponse');

const milestoneController = {
  async getAll(req, res, next) {
    try {
      const result = await MilestoneService.getAll(req.query);
      return ApiResponse.success(res, {
        milestones: result.milestones,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Milestones fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const milestone = await MilestoneService.getById(req.params.id);
      return ApiResponse.success(res, { milestone }, 'Milestone fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const milestone = await MilestoneService.create(req.body);
      return ApiResponse.success(res, { milestone }, 'Milestone created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const milestone = await MilestoneService.update(req.params.id, req.body);
      return ApiResponse.success(res, { milestone }, 'Milestone updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await MilestoneService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Milestone deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = milestoneController;
