const TimeEntryService = require('../services/timeEntryService');
const ApiResponse = require('../utils/ApiResponse');

const timeEntryController = {
  async start(req, res, next) {
    try {
      const entry = await TimeEntryService.startTimer(req.user.id, req.body);
      return ApiResponse.success(res, { entry }, 'Timer started successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async stop(req, res, next) {
    try {
      const entry = await TimeEntryService.stopTimer(req.user.id, req.params.id);
      return ApiResponse.success(res, { entry }, 'Timer stopped successfully');
    } catch (error) {
      next(error);
    }
  },

  async getActive(req, res, next) {
    try {
      const entry = await TimeEntryService.getActiveTimer(req.user.id);
      return ApiResponse.success(res, { entry }, 'Active timer fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const entry = await TimeEntryService.createManual(req.user.id, req.body);
      return ApiResponse.success(res, { entry }, 'Time entry created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const query = { ...req.query, userId: req.query.userId || req.user.id };
      const result = await TimeEntryService.getAll(query);
      return ApiResponse.success(res, {
        entries: result.entries,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Time entries fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByTask(req, res, next) {
    try {
      const entries = await TimeEntryService.getByTask(req.params.taskId);
      return ApiResponse.success(res, { entries }, 'Time entries fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getWeeklyReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return ApiResponse.error(res, 'Start date and end date are required', 400);
      }
      const report = await TimeEntryService.getWeeklyReport(req.user.id, startDate, endDate);
      return ApiResponse.success(res, report, 'Weekly report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await TimeEntryService.delete(req.user.id, req.params.id);
      return ApiResponse.success(res, null, 'Time entry deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = timeEntryController;
