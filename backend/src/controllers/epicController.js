const EpicService = require('../services/epicService');
const ApiResponse = require('../utils/ApiResponse');

const epicController = {
  async getAll(req, res, next) {
    try {
      const result = await EpicService.getAll(req.query);
      return ApiResponse.success(res, {
        epics: result.epics,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Epics fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const epic = await EpicService.getById(req.params.id);
      return ApiResponse.success(res, { epic }, 'Epic fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const epic = await EpicService.create(req.body);
      return ApiResponse.success(res, { epic }, 'Epic created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const epic = await EpicService.update(req.params.id, req.body);
      return ApiResponse.success(res, { epic }, 'Epic updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await EpicService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Epic deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = epicController;
