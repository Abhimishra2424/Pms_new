const activityLogService = require('../services/activityLogService');
const ApiResponse = require('../utils/ApiResponse');

const activityLogController = {
  async getAll(req, res, next) {
    try {
      const query = { ...req.query, companyId: req.user.companyId };
      const result = await activityLogService.getAll(query);
      return ApiResponse.success(res, result, 'Activity logs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByResource(req, res, next) {
    try {
      const { resourceType, resourceId } = req.params;
      const logs = await activityLogService.getByResource(resourceType, resourceId);
      return ApiResponse.success(res, { activityLogs: logs }, 'Activity logs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const logs = await activityLogService.getByUser(userId);
      return ApiResponse.success(res, { activityLogs: logs }, 'Activity logs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByDateRange(req, res, next) {
    try {
      const query = {
        ...req.query,
        companyId: req.user.companyId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const result = await activityLogService.getAll(query);
      return ApiResponse.success(res, result, 'Activity logs fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = activityLogController;
