const { Op } = require('sequelize');
const { Leave, User } = require('../models');

const LeaveRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', userId, companyId, status, type, startDate, endDate } = query;

    const where = {};
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = startDate;
      if (endDate) where.endDate = { [Op.lte]: endDate };
    }

    const allowedSortFields = ['createdAt', 'startDate', 'endDate', 'status', 'type'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { leaves, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Leave.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
    });
  },

  async findByUserId(userId, query = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', status } = query;

    const where = { userId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count: total, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
      order: [[sortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { leaves, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findPendingByCompany(companyId) {
    return Leave.findAll({
      where: { companyId, status: 'pending' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  async findApprovedByUserAndYear(userId, year) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    return Leave.findAll({
      where: {
        userId,
        status: 'approved',
        startDate: { [Op.lte]: endDate },
        endDate: { [Op.gte]: startDate },
      },
    });
  },

  async create(data) {
    return Leave.create(data);
  },

  async update(id, data) {
    const leave = await Leave.findByPk(id, { paranoid: false });
    if (!leave) return null;
    await leave.update(data);
    return leave;
  },

  async delete(id) {
    const leave = await Leave.findByPk(id, { paranoid: false });
    if (!leave) return false;
    await leave.destroy();
    return true;
  },
};

module.exports = LeaveRepository;
