const AnnouncementService = require('../services/announcementService');
const ApiResponse = require('../utils/ApiResponse');

const announcementController = {
  async create(req, res, next) {
    try {
      const announcement = await AnnouncementService.create({ ...req.body, companyId: req.user.companyId }, req.user.id);
      return ApiResponse.success(res, { announcement }, 'Announcement created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await AnnouncementService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        announcements: result.announcements,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Announcements fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const announcement = await AnnouncementService.getById(req.params.id);
      return ApiResponse.success(res, { announcement }, 'Announcement fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const announcement = await AnnouncementService.update(req.params.id, req.body);
      return ApiResponse.success(res, { announcement }, 'Announcement updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await AnnouncementService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Announcement deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async publish(req, res, next) {
    try {
      const announcement = await AnnouncementService.publish(req.params.id);
      return ApiResponse.success(res, { announcement }, 'Announcement published successfully');
    } catch (error) {
      next(error);
    }
  },

  async archive(req, res, next) {
    try {
      const announcement = await AnnouncementService.archive(req.params.id);
      return ApiResponse.success(res, { announcement }, 'Announcement archived successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = announcementController;
