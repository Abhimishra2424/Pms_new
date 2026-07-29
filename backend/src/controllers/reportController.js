const reportService = require('../services/reportService');
const ApiResponse = require('../utils/ApiResponse');

const reportController = {
  async getEmployeeReport(req, res, next) {
    try {
      const data = await reportService.getEmployeeReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Employee report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getProjectReport(req, res, next) {
    try {
      const data = await reportService.getProjectReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Project report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getTaskReport(req, res, next) {
    try {
      const data = await reportService.getTaskReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Task report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSprintReport(req, res, next) {
    try {
      const data = await reportService.getSprintReport(req.query);
      return ApiResponse.success(res, data, 'Sprint report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getBugReport(req, res, next) {
    try {
      const data = await reportService.getBugReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Bug report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getTimesheetReport(req, res, next) {
    try {
      const data = await reportService.getTimesheetReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Timesheet report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPerformanceReport(req, res, next) {
    try {
      const data = await reportService.getPerformanceReport({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Performance report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getDashboardStats(req, res, next) {
    try {
      const data = await reportService.getDashboardStats({ companyId: req.user.companyId });
      return ApiResponse.success(res, data, 'Dashboard stats fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportController;
