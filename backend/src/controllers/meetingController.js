const MeetingService = require('../services/meetingService');
const ApiResponse = require('../utils/ApiResponse');

const meetingController = {
  async create(req, res, next) {
    try {
      const meeting = await MeetingService.create(req.body, req.user.id);
      return ApiResponse.success(res, { meeting }, 'Meeting created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await MeetingService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        meetings: result.meetings,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Meetings fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const meeting = await MeetingService.getById(req.params.id);
      return ApiResponse.success(res, { meeting }, 'Meeting fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const meeting = await MeetingService.update(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, { meeting }, 'Meeting updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await MeetingService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Meeting deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByProject(req, res, next) {
    try {
      const meetings = await MeetingService.getByProject(req.params.projectId);
      return ApiResponse.success(res, { meetings }, 'Meetings fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = meetingController;
