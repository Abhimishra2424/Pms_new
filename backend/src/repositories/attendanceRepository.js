const { Op } = require('sequelize');
const { Attendance, User } = require('../models');

const AttendanceRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', userId, companyId, status, startDate, endDate } = query;

    const where = {};
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const allowedSortFields = ['createdAt', 'date', 'clockIn', 'clockOut', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (page - 1) * limit;

    const { count: total, rows: attendances } = await Attendance.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
      ],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { attendances, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Attendance.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
      ],
    });
  },

  async findByUserAndDate(userId, date) {
    return Attendance.findOne({
      where: { userId, date },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
    });
  },

  async findByCompanyAndDateRange(companyId, startDate, endDate) {
    return Attendance.findAll({
      where: {
        companyId,
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'] },
      ],
      order: [['date', 'ASC'], ['clockIn', 'ASC']],
    });
  },

  async findByUserAndMonth(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return Attendance.findAll({
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [['date', 'ASC']],
    });
  },

  async create(data) {
    return Attendance.create(data);
  },

  async update(id, data) {
    const attendance = await Attendance.findByPk(id, { paranoid: false });
    if (!attendance) return null;
    await attendance.update(data);
    return attendance;
  },

  async delete(id) {
    const attendance = await Attendance.findByPk(id, { paranoid: false });
    if (!attendance) return false;
    await attendance.destroy();
    return true;
  },
};

module.exports = AttendanceRepository;
