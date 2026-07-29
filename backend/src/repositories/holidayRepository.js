const { Op } = require('sequelize');
const { Holiday, Company } = require('../models');

const HolidayRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', companyId, year, type } = query;

    const where = {};
    if (companyId) where.companyId = companyId;
    if (year) where.year = parseInt(year, 10);
    if (type) where.type = type;

    const allowedSortFields = ['createdAt', 'name', 'date', 'type', 'year'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';

    const offset = (page - 1) * limit;

    const { count: total, rows: holidays } = await Holiday.findAndCountAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'slug'] },
      ],
      order: [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { holidays, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Holiday.findByPk(id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'slug'] },
      ],
    });
  },

  async findByCompanyAndDate(companyId, date) {
    return Holiday.findOne({ where: { companyId, date } });
  },

  async findByCompanyAndYear(companyId, year) {
    return Holiday.findAll({
      where: { companyId, year: parseInt(year, 10) },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['date', 'ASC']],
    });
  },

  async create(data) {
    return Holiday.create(data);
  },

  async update(id, data) {
    const holiday = await Holiday.findByPk(id, { paranoid: false });
    if (!holiday) return null;
    await holiday.update(data);
    return holiday;
  },

  async delete(id) {
    const holiday = await Holiday.findByPk(id, { paranoid: false });
    if (!holiday) return false;
    await holiday.destroy();
    return true;
  },
};

module.exports = HolidayRepository;
