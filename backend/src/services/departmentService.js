const { Company, User } = require('../models');
const departmentRepository = require('../repositories/departmentRepository');
const ApiError = require('../utils/ApiError');

class DepartmentService {
  async getAll(query) {
    return departmentRepository.findAll(query);
  }

  async getById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    return department;
  }

  async create(data) {
    const company = await Company.findByPk(data.companyId);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    if (data.headId) {
      const head = await User.findByPk(data.headId);
      if (!head) {
        throw ApiError.notFound('Department head not found');
      }
      if (head.companyId !== data.companyId) {
        throw ApiError.badRequest('Department head must belong to the same company');
      }
    }

    return departmentRepository.create(data);
  }

  async update(id, data) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    if (data.companyId) {
      const company = await Company.findByPk(data.companyId);
      if (!company) {
        throw ApiError.notFound('Company not found');
      }
    }

    if (data.headId) {
      const head = await User.findByPk(data.headId);
      if (!head) {
        throw ApiError.notFound('Department head not found');
      }
      const targetCompanyId = data.companyId || department.companyId;
      if (head.companyId !== targetCompanyId) {
        throw ApiError.badRequest('Department head must belong to the same company');
      }
    }

    if (data.headId === null || data.headId === '') {
      data.headId = null;
    }

    return departmentRepository.update(id, data);
  }

  async delete(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    await departmentRepository.delete(id);

    await User.update(
      { departmentId: null },
      { where: { departmentId: id } }
    );

    return { message: 'Department deleted successfully' };
  }
}

module.exports = new DepartmentService();
