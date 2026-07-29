const { Designation, Department, Company } = require('../models');
const { Op } = require('sequelize');
const PaginationHelper = require('../utils/pagination');

class DesignationRepository {
  async findAll(query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {};

    if (query.search) {
      where.title = { [Op.iLike]: `%${query.search}%` };
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await Designation.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);

    return { data: rows, meta };
  }

  async findById(id) {
    return Designation.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
  }

  async create(data) {
    return Designation.create(data);
  }

  async update(id, data) {
    const designation = await Designation.findByPk(id);
    if (!designation) return null;
    return designation.update(data);
  }

  async delete(id) {
    const designation = await Designation.findByPk(id);
    if (!designation) return null;
    await designation.destroy();
    return designation;
  }
}

module.exports = new DesignationRepository();
