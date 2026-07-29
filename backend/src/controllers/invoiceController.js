const InvoiceService = require('../services/invoiceService');
const ApiResponse = require('../utils/ApiResponse');

const invoiceController = {
  async create(req, res, next) {
    try {
      const invoice = await InvoiceService.create({ ...req.body, companyId: req.user.companyId });
      return ApiResponse.success(res, { invoice }, 'Invoice created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await InvoiceService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        invoices: result.invoices,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Invoices fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const invoice = await InvoiceService.getById(req.params.id);
      return ApiResponse.success(res, { invoice }, 'Invoice fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const invoice = await InvoiceService.update(req.params.id, req.body);
      return ApiResponse.success(res, { invoice }, 'Invoice updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await InvoiceService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Invoice deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByClient(req, res, next) {
    try {
      const invoices = await InvoiceService.getByClient(req.params.clientId);
      return ApiResponse.success(res, { invoices }, 'Invoices fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async sendInvoice(req, res, next) {
    try {
      const invoice = await InvoiceService.sendInvoice(req.params.id);
      return ApiResponse.success(res, { invoice }, 'Invoice sent successfully');
    } catch (error) {
      next(error);
    }
  },

  async markAsPaid(req, res, next) {
    try {
      const invoice = await InvoiceService.markAsPaid(req.params.id, req.body.amount);
      return ApiResponse.success(res, { invoice }, 'Invoice marked as paid successfully');
    } catch (error) {
      next(error);
    }
  },

  async generatePdf(req, res, next) {
    try {
      const invoice = await InvoiceService.generatePdf(req.params.id);
      return ApiResponse.success(res, { invoice }, 'PDF data fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = invoiceController;
