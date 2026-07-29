const settingService = require('../services/settingService');
const ApiResponse = require('../utils/ApiResponse');

const settingController = {
  async getAll(req, res, next) {
    try {
      const settings = await settingService.getAll(req.user.companyId);
      return ApiResponse.success(res, { settings }, 'Settings fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByKey(req, res, next) {
    try {
      const setting = await settingService.getByKey(req.user.companyId, req.params.key);
      return ApiResponse.success(res, { setting }, 'Setting fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const setting = await settingService.update(req.user.companyId, req.params.key, req.body.value);
      return ApiResponse.success(res, { setting }, 'Setting updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateBulk(req, res, next) {
    try {
      const settings = await settingService.updateBulk(req.user.companyId, req.body.settings);
      return ApiResponse.success(res, { settings }, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = settingController;
