const WikiService = require('../services/wikiService');
const ApiResponse = require('../utils/ApiResponse');

const wikiController = {
  async create(req, res, next) {
    try {
      const page = await WikiService.create({ ...req.body, companyId: req.user.companyId }, req.user.id);
      return ApiResponse.success(res, { page }, 'Wiki page created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await WikiService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        pages: result.pages,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Wiki pages fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const page = await WikiService.getById(req.params.id);
      return ApiResponse.success(res, { page }, 'Wiki page fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const page = await WikiService.update(req.params.id, req.body);
      return ApiResponse.success(res, { page }, 'Wiki page updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await WikiService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Wiki page deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getTree(req, res, next) {
    try {
      const tree = await WikiService.getTree(req.params.projectId);
      return ApiResponse.success(res, { tree }, 'Wiki tree fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = wikiController;
