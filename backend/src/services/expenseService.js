const ApiError = require('../utils/ApiError');
const ExpenseRepository = require('../repositories/expenseRepository');

const ExpenseService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      userId: query.userId,
      category: query.category,
      status: query.status,
      companyId: query.companyId,
      expenseDateFrom: query.expenseDateFrom,
      expenseDateTo: query.expenseDateTo,
      isBillable: query.isBillable,
    };
    return ExpenseRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const expense = await ExpenseRepository.findById(id);
    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }
    return expense;
  },

  async create(data, userId) {
    return ExpenseRepository.create({ ...data, userId });
  },

  async update(id, data) {
    const expense = await this.getById(id);

    if (expense.status === 'approved' || expense.status === 'rejected') {
      throw ApiError.badRequest('Cannot update an expense that has been approved or rejected');
    }

    await ExpenseRepository.update(id, data);
    return ExpenseRepository.findById(id);
  },

  async delete(id) {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    if (expense.status === 'approved') {
      throw ApiError.badRequest('Cannot delete an approved expense');
    }

    return ExpenseRepository.delete(id);
  },

  async approve(id, approverId) {
    const expense = await this.getById(id);

    if (expense.status !== 'pending') {
      throw ApiError.badRequest('Only pending expenses can be approved');
    }

    await ExpenseRepository.update(id, {
      status: 'approved',
      approvedBy: approverId,
    });

    return ExpenseRepository.findById(id);
  },

  async reject(id, reason) {
    const expense = await this.getById(id);

    if (expense.status !== 'pending') {
      throw ApiError.badRequest('Only pending expenses can be rejected');
    }

    await ExpenseRepository.update(id, {
      status: 'rejected',
      notes: reason ? `${expense.notes || ''}\nRejection reason: ${reason}`.trim() : expense.notes,
    });

    return ExpenseRepository.findById(id);
  },

  async getByProject(projectId) {
    return ExpenseRepository.findByProject(projectId);
  },

  async getByCategory(category, companyId) {
    return ExpenseRepository.findByCategory(category, companyId);
  },
};

module.exports = ExpenseService;
