const importService = require('../services/importService');
const ApiResponse = require('../utils/ApiResponse');

const importController = {
  async importEmployees(req, res, next) {
    try {
      const validation = await importService.parseAndValidate(req.file, 'employees');
      if (validation.errors.length > 0) {
        return ApiResponse.success(res, validation, 'File parsed with some validation errors');
      }

      const result = await importService.bulkImport(validation.validRows, 'employees', req.user.companyId);
      return ApiResponse.success(res, { validation, importResult: result }, 'Employees imported successfully');
    } catch (error) {
      next(error);
    }
  },

  async importProjects(req, res, next) {
    try {
      const validation = await importService.parseAndValidate(req.file, 'projects');
      if (validation.errors.length > 0) {
        return ApiResponse.success(res, validation, 'File parsed with some validation errors');
      }

      const result = await importService.bulkImport(validation.validRows, 'projects', req.user.companyId);
      return ApiResponse.success(res, { validation, importResult: result }, 'Projects imported successfully');
    } catch (error) {
      next(error);
    }
  },

  async importTasks(req, res, next) {
    try {
      const validation = await importService.parseAndValidate(req.file, 'tasks');
      if (validation.errors.length > 0) {
        return ApiResponse.success(res, validation, 'File parsed with some validation errors');
      }

      const result = await importService.bulkImport(validation.validRows, 'tasks', req.user.companyId);
      return ApiResponse.success(res, { validation, importResult: result }, 'Tasks imported successfully');
    } catch (error) {
      next(error);
    }
  },

  async importClients(req, res, next) {
    try {
      const validation = await importService.parseAndValidate(req.file, 'clients');
      if (validation.errors.length > 0) {
        return ApiResponse.success(res, validation, 'File parsed with some validation errors');
      }

      const result = await importService.bulkImport(validation.validRows, 'clients', req.user.companyId);
      return ApiResponse.success(res, { validation, importResult: result }, 'Clients imported successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = importController;
