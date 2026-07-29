const HolidayService = require('../services/holidayService');
const ApiResponse = require('../utils/ApiResponse');

const holidayController = {
  async getAll(req, res, next) {
    try {
      const query = { ...req.query, companyId: req.query.companyId || req.user.companyId };
      const result = await HolidayService.getAll(query);
      return ApiResponse.success(res, {
        holidays: result.holidays,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Holidays fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const holiday = await HolidayService.getById(req.params.id);
      return ApiResponse.success(res, { holiday }, 'Holiday fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = { ...req.body, companyId: req.body.companyId || req.user.companyId };
      const holiday = await HolidayService.create(data);
      return ApiResponse.success(res, { holiday }, 'Holiday created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const holiday = await HolidayService.update(req.params.id, req.body);
      return ApiResponse.success(res, { holiday }, 'Holiday updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await HolidayService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Holiday deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByYear(req, res, next) {
    try {
      const { year } = req.params;
      const holidays = await HolidayService.getByYear(req.user.companyId, year);
      return ApiResponse.success(res, { holidays }, 'Holidays fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = holidayController;
