const ExpenseService = require('../services/expenseService');
const ApiResponse = require('../utils/ApiResponse');

const expenseController = {
  async create(req, res, next) {
    try {
      const expense = await ExpenseService.create({ ...req.body, companyId: req.user.companyId }, req.user.id);
      return ApiResponse.success(res, { expense }, 'Expense created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await ExpenseService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        expenses: result.expenses,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Expenses fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const expense = await ExpenseService.getById(req.params.id);
      return ApiResponse.success(res, { expense }, 'Expense fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const expense = await ExpenseService.update(req.params.id, req.body);
      return ApiResponse.success(res, { expense }, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ExpenseService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const expense = await ExpenseService.approve(req.params.id, req.user.id);
      return ApiResponse.success(res, { expense }, 'Expense approved successfully');
    } catch (error) {
      next(error);
    }
  },

  async reject(req, res, next) {
    try {
      const expense = await ExpenseService.reject(req.params.id, req.body.reason);
      return ApiResponse.success(res, { expense }, 'Expense rejected successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByProject(req, res, next) {
    try {
      const expenses = await ExpenseService.getByProject(req.params.projectId);
      return ApiResponse.success(res, { expenses }, 'Expenses fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req, res, next) {
    try {
      const expenses = await ExpenseService.getByCategory(req.params.category, req.user.companyId);
      return ApiResponse.success(res, { expenses }, 'Expenses fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = expenseController;
