const { notificationService } = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');

const notificationController = {
  async getAll(req, res, next) {
    try {
      const result = await notificationService.getAll(req.user.id, req.query);
      return ApiResponse.success(res, result, 'Notifications fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      return ApiResponse.success(res, { count }, 'Unread count fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await notificationService.delete(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
