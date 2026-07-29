const LeaveService = require('../services/leaveService');
const ApiResponse = require('../utils/ApiResponse');

const leaveController = {
  async apply(req, res, next) {
    try {
      const leave = await LeaveService.apply(req.user.id, req.user.companyId, req.body);
      return ApiResponse.success(res, { leave }, 'Leave applied successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const leave = await LeaveService.approve(req.params.id, req.user.id);
      return ApiResponse.success(res, { leave }, 'Leave approved successfully');
    } catch (error) {
      next(error);
    }
  },

  async reject(req, res, next) {
    try {
      const { reason } = req.body;
      const leave = await LeaveService.reject(req.params.id, req.user.id, reason);
      return ApiResponse.success(res, { leave }, 'Leave rejected successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const query = { ...req.query, companyId: req.query.companyId || req.user.companyId };
      const result = await LeaveService.getAll(query);
      return ApiResponse.success(res, {
        leaves: result.leaves,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Leaves fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await LeaveService.getByUser(userId || req.user.id, req.query);
      return ApiResponse.success(res, {
        leaves: result.leaves,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Leaves fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPending(req, res, next) {
    try {
      const leaves = await LeaveService.getPending(req.user.companyId);
      return ApiResponse.success(res, { leaves }, 'Pending leaves fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getBalance(req, res, next) {
    try {
      const { userId } = req.params;
      const { year } = req.query;
      const balance = await LeaveService.getLeaveBalance(userId || req.user.id, year);
      return ApiResponse.success(res, balance, 'Leave balance fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const leave = await LeaveService.cancel(req.params.id, req.user.id);
      return ApiResponse.success(res, { leave }, 'Leave cancelled successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leaveController;
