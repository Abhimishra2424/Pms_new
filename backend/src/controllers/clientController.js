const ClientService = require('../services/clientService');
const ApiResponse = require('../utils/ApiResponse');

const clientController = {
  async create(req, res, next) {
    try {
      const client = await ClientService.create({ ...req.body, companyId: req.user.companyId });
      return ApiResponse.success(res, { client }, 'Client created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await ClientService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        clients: result.clients,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Clients fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const client = await ClientService.getById(req.params.id);
      return ApiResponse.success(res, { client }, 'Client fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const client = await ClientService.update(req.params.id, req.body);
      return ApiResponse.success(res, { client }, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ClientService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Client deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = clientController;
