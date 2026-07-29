const { User, Company, Department, Designation } = require('../models');
const { Op } = require('sequelize');
const PaginationHelper = require('../utils/pagination');

class EmployeeRepository {
  async findAll(query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {
      role: {
        [Op.notIn]: ['client', 'super_admin'],
      },
    };

    if (query.search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${query.search}%` } },
        { lastName: { [Op.iLike]: `%${query.search}%` } },
        { email: { [Op.iLike]: `%${query.search}%` } },
        { employeeId: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.managerId) {
      where.managerId = query.managerId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status !== undefined) {
      where.isActive = query.status === 'active' || query.status === true;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'title', 'hierarchyLevel'],
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);

    return { data: rows, meta };
  }

  async findById(id) {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'title', 'hierarchyLevel'],
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'subordinates',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
      ],
    });
  }

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findByEmployeeId(employeeId) {
    return User.findOne({ where: { employeeId } });
  }

  async create(data) {
    return User.create(data);
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return user;
  }

  async findByDepartment(departmentId, query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {
      departmentId,
      role: { [Op.notIn]: ['client', 'super_admin'] },
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'title'] },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);
    return { data: rows, meta };
  }

  async findByCompany(companyId, query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {
      companyId,
      role: { [Op.notIn]: ['client', 'super_admin'] },
    };

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'title'] },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);
    return { data: rows, meta };
  }

  async findByManager(managerId, query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = {
      managerId,
      role: { [Op.notIn]: ['client', 'super_admin'] },
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'title'] },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);
    return { data: rows, meta };
  }

  async findByRole(role, query) {
    const { page, limit, offset, order } = PaginationHelper.getPaginationOptions(query);
    const where = { role };

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order,
      offset,
      limit,
      distinct: true,
      attributes: { exclude: ['password'] },
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'title'] },
      ],
    });

    const meta = PaginationHelper.getPaginationMeta(count, page, limit);
    return { data: rows, meta };
  }
}

module.exports = new EmployeeRepository();
