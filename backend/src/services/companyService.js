const { Company, User, Project, Department, Designation } = require('../models');
const companyRepository = require('../repositories/companyRepository');
const ApiError = require('../utils/ApiError');
const Helpers = require('../utils/helpers');
const sequelize = require('../config/database');

class CompanyService {
  async getAll(query) {
    return companyRepository.findAll(query);
  }

  async getById(id) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }
    return company;
  }

  async create(data) {
    const slug = Helpers.slugify(data.name);

    const existingSlug = await companyRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.badRequest('A company with this name already exists');
    }

    if (data.email) {
      const existingEmail = await companyRepository.findByEmail(data.email);
      if (existingEmail) {
        throw ApiError.badRequest('A company with this email already exists');
      }
    }

    return companyRepository.create({ ...data, slug });
  }

  async update(id, data) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    if (data.name && data.name !== company.name) {
      data.slug = Helpers.slugify(data.name);

      const existingSlug = await companyRepository.findBySlug(data.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw ApiError.badRequest('A company with this name already exists');
      }
    }

    if (data.email && data.email !== company.email) {
      const existingEmail = await companyRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw ApiError.badRequest('A company with this email already exists');
      }
    }

    return companyRepository.update(id, data);
  }

  async delete(id) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    const userCount = await User.count({ where: { companyId: id } });
    if (userCount > 0) {
      throw ApiError.badRequest('Cannot delete company with existing users. Please reassign or remove users first.');
    }

    const projectCount = await Project.count({ where: { companyId: id } });
    if (projectCount > 0) {
      throw ApiError.badRequest('Cannot delete company with existing projects. Please delete projects first.');
    }

    const departmentCount = await Department.count({ where: { companyId: id } });
    if (departmentCount > 0) {
      throw ApiError.badRequest('Cannot delete company with existing departments. Please delete departments first.');
    }

    const designationCount = await Designation.count({ where: { companyId: id } });
    if (designationCount > 0) {
      throw ApiError.badRequest('Cannot delete company with existing designations. Please delete designations first.');
    }

    return companyRepository.delete(id);
  }
}

module.exports = new CompanyService();
