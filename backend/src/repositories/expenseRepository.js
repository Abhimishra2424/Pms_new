const { Op } = require('sequelize');
const { Expense, User, Project, Company } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const ExpenseRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      projectId, userId, category, status, companyId,
      expenseDateFrom, expenseDateTo, isBillable,
    } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (isBillable !== undefined) where.isBillable = isBillable === 'true' || isBillable === true;

    if (expenseDateFrom || expenseDateTo) {
      where.expenseDate = {};
      if (expenseDateFrom) where.expenseDate[Op.gte] = expenseDateFrom;
      if (expenseDateTo) where.expenseDate[Op.lte] = expenseDateTo;
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'expenseDate', 'amount', 'category', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: expenses } = await Expense.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: userAttributes },
        { model: User, as: 'approver', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { expenses, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Expense.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: userAttributes },
        { model: User, as: 'approver', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
    });
  },

  async findByProject(projectId) {
    return Expense.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'user', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      order: [['expenseDate', 'DESC']],
    });
  },

  async findByCategory(category, companyId) {
    const where = { category };
    if (companyId) where.companyId = companyId;

    return Expense.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
      order: [['expenseDate', 'DESC']],
    });
  },

  async create(data, options) {
    return Expense.create(data, options);
  },

  async update(id, data, options) {
    const expense = await Expense.findByPk(id);
    if (!expense) return null;
    await expense.update(data, options);
    return expense;
  },

  async delete(id, options) {
    const expense = await Expense.findByPk(id);
    if (!expense) return false;
    await expense.destroy(options);
    return true;
  },
};

module.exports = ExpenseRepository;
