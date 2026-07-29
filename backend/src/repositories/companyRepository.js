const { Company } = require('../models');
const { Op } = require('sequelize');
const PaginationHelper = require('../utils/pagination');

class CompanyRepository {
  async findAll(query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {};

    if (query.search) {
      where.name = { [Op.iLike]: `%${query.search}%` };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    if (query.industry) {
      where.industry = query.industry;
    }

    const { rows, count } = await Company.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);

    return { data: rows, meta };
  }

  async findById(id) {
    return Company.findByPk(id);
  }

  async findBySlug(slug) {
    return Company.findOne({ where: { slug } });
  }

  async findByEmail(email) {
    return Company.findOne({ where: { email } });
  }

  async create(data) {
    return Company.create(data);
  }

  async update(id, data) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    return company.update(data);
  }

  async delete(id) {
    const company = await Company.findByPk(id);
    if (!company) return null;
    await company.destroy();
    return company;
  }
}

module.exports = new CompanyRepository();
