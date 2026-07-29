const { Company, Department } = require('../models');
const designationRepository = require('../repositories/designationRepository');
const ApiError = require('../utils/ApiError');

class DesignationService {
  async getAll(query) {
    return designationRepository.findAll(query);
  }

  async getById(id) {
    const designation = await designationRepository.findById(id);
    if (!designation) {
      throw ApiError.notFound('Designation not found');
    }
    return designation;
  }

  async create(data) {
    const company = await Company.findByPk(data.companyId);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    const department = await Department.findByPk(data.departmentId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    if (department.companyId !== data.companyId) {
      throw ApiError.badRequest('Department does not belong to the specified company');
    }

    return designationRepository.create(data);
  }

  async update(id, data) {
    const designation = await designationRepository.findById(id);
    if (!designation) {
      throw ApiError.notFound('Designation not found');
    }

    if (data.companyId) {
      const company = await Company.findByPk(data.companyId);
      if (!company) {
        throw ApiError.notFound('Company not found');
      }
    }

    if (data.departmentId) {
      const department = await Department.findByPk(data.departmentId);
      if (!department) {
        throw ApiError.notFound('Department not found');
      }

      const targetCompanyId = data.companyId || designation.companyId;
      if (department.companyId !== targetCompanyId) {
        throw ApiError.badRequest('Department does not belong to the specified company');
      }
    }

    if (data.hierarchyLevel === null || data.hierarchyLevel === '') {
      data.hierarchyLevel = null;
    }

    return designationRepository.update(id, data);
  }

  async delete(id) {
    const designation = await designationRepository.findById(id);
    if (!designation) {
      throw ApiError.notFound('Designation not found');
    }
    return designationRepository.delete(id);
  }
}

module.exports = new DesignationService();
