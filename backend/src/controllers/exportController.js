const exportService = require('../services/exportService');
const ApiResponse = require('../utils/ApiResponse');

const exportController = {
  async exportProjects(req, res, next) {
    try {
      const result = await exportService.exportProjects(req.user.companyId, req.query);
      const csv = exportService.generateCSV(result.headers, result.data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportTasks(req, res, next) {
    try {
      const result = await exportService.exportTasks(req.user.companyId, req.query);
      const csv = exportService.generateCSV(result.headers, result.data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportEmployees(req, res, next) {
    try {
      const result = await exportService.exportEmployees(req.user.companyId, req.query);
      const csv = exportService.generateCSV(result.headers, result.data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportInvoices(req, res, next) {
    try {
      const result = await exportService.exportInvoices(req.user.companyId, req.query);
      const csv = exportService.generateCSV(result.headers, result.data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = exportController;
