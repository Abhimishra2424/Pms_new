const { Department, Company, User } = require('../models');
const { Op } = require('sequelize');
const PaginationHelper = require('../utils/pagination');

class DepartmentRepository {
  async findAll(query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {};

    if (query.search) {
      where.name = { [Op.iLike]: `%${query.search}%` };
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await Department.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);

    return { data: rows, meta };
  }

  async findById(id) {
    return Department.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async create(data) {
    return Department.create(data);
  }

  async update(id, data) {
    const department = await Department.findByPk(id);
    if (!department) return null;
    return department.update(data);
  }

  async delete(id) {
    const department = await Department.findByPk(id);
    if (!department) return null;
    await department.destroy();
    return department;
  }
}

module.exports = new DepartmentRepository();
