const AttendanceService = require('../services/attendanceService');
const ApiResponse = require('../utils/ApiResponse');

const attendanceController = {
  async clockIn(req, res, next) {
    try {
      const attendance = await AttendanceService.clockIn(req.user.id, req.user.companyId);
      return ApiResponse.success(res, { attendance }, 'Clocked in successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async clockOut(req, res, next) {
    try {
      const attendance = await AttendanceService.clockOut(req.user.id);
      return ApiResponse.success(res, { attendance }, 'Clocked out successfully');
    } catch (error) {
      next(error);
    }
  },

  async getToday(req, res, next) {
    try {
      const attendance = await AttendanceService.getToday(req.user.id);
      return ApiResponse.success(res, { attendance }, 'Today attendance fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const query = { ...req.query, companyId: req.query.companyId || req.user.companyId };
      const result = await AttendanceService.getAll(query);
      return ApiResponse.success(res, {
        attendances: result.attendances,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Attendances fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const attendances = await AttendanceService.getByDateRange(
        req.query.companyId || req.user.companyId,
        startDate,
        endDate
      );
      return ApiResponse.success(res, { attendances }, 'Attendances fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyReport(req, res, next) {
    try {
      const { userId } = req.params;
      const { month, year } = req.query;
      const report = await AttendanceService.getMonthlyReport(
        userId || req.user.id,
        month,
        year
      );
      return ApiResponse.success(res, report, 'Monthly report fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async markAbsent(req, res, next) {
    try {
      const { userId, date } = req.body;
      const attendance = await AttendanceService.markAbsent(
        userId,
        req.user.companyId,
        date
      );
      return ApiResponse.success(res, { attendance }, 'Absent marked successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getTeamAttendance(req, res, next) {
    try {
      const { date } = req.query;
      const teamAttendance = await AttendanceService.getTeamAttendance(req.user.id, date);
      return ApiResponse.success(res, { teamAttendance }, 'Team attendance fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = attendanceController;
