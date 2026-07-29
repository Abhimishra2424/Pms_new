const { Company, Department, Designation, User } = require('../models');
const employeeRepository = require('../repositories/employeeRepository');
const ApiError = require('../utils/ApiError');
const sequelize = require('../config/database');

class EmployeeService {
  async getAll(query) {
    return employeeRepository.findAll(query);
  }

  async getById(id) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }
    return employee;
  }

  async create(data) {
    const company = await Company.findByPk(data.companyId);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    if (data.departmentId) {
      const department = await Department.findByPk(data.departmentId);
      if (!department) {
        throw ApiError.notFound('Department not found');
      }
      if (department.companyId !== data.companyId) {
        throw ApiError.badRequest('Department does not belong to the specified company');
      }
    }

    if (data.designationId) {
      const designation = await Designation.findByPk(data.designationId);
      if (!designation) {
        throw ApiError.notFound('Designation not found');
      }
      if (designation.companyId !== data.companyId) {
        throw ApiError.badRequest('Designation does not belong to the specified company');
      }
    }

    if (data.managerId) {
      const manager = await User.findByPk(data.managerId);
      if (!manager) {
        throw ApiError.notFound('Manager not found');
      }
      if (manager.companyId !== data.companyId) {
        throw ApiError.badRequest('Manager must belong to the same company');
      }
    }

    if (!data.employeeId) {
      data.employeeId = await this.generateEmployeeId();
    }

    if (!data.password) {
      data.password = 'Change@123';
    }

    data.role = data.role || 'developer';

    return employeeRepository.create(data);
  }

  async update(id, data) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found');
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
      const targetCompanyId = data.companyId || employee.companyId;
      if (department.companyId !== targetCompanyId) {
        throw ApiError.badRequest('Department does not belong to the specified company');
      }
    }

    if (data.designationId) {
      const designation = await Designation.findByPk(data.designationId);
      if (!designation) {
        throw ApiError.notFound('Designation not found');
      }
      const targetCompanyId = data.companyId || employee.companyId;
      if (designation.companyId !== targetCompanyId) {
        throw ApiError.badRequest('Designation does not belong to the specified company');
      }
    }

    if (data.managerId) {
      const manager = await User.findByPk(data.managerId);
      if (!manager) {
        throw ApiError.notFound('Manager not found');
      }
      const targetCompanyId = data.companyId || employee.companyId;
      if (manager.companyId !== targetCompanyId) {
        throw ApiError.badRequest('Manager must belong to the same company');
      }
    }

    if (data.email) {
      const existingEmail = await employeeRepository.findByEmail(data.email);
      if (existingEmail && existingEmail.id !== id) {
        throw ApiError.badRequest('Email already in use');
      }
    }

    if (data.employeeId) {
      const existingEmpId = await employeeRepository.findByEmployeeId(data.employeeId);
      if (existingEmpId && existingEmpId.id !== id) {
        throw ApiError.badRequest('Employee ID already in use');
      }
    }

    if (data.password && data.password === '') {
      delete data.password;
    }

    const nullFields = ['departmentId', 'designationId', 'managerId', 'gender', 'dateOfBirth', 'dateOfJoining'];
    nullFields.forEach((field) => {
      if (data[field] === null || data[field] === '') {
        data[field] = null;
      }
    });

    return employeeRepository.update(id, data);
  }

  async delete(id) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }

    const subordinateCount = await User.count({ where: { managerId: id } });
    if (subordinateCount > 0) {
      throw ApiError.badRequest('Cannot delete employee who is a manager of other employees. Please reassign subordinates first.');
    }

    return employeeRepository.delete(id);
  }

  async getByDepartment(departmentId, query) {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    return employeeRepository.findByDepartment(departmentId, query);
  }

  async getByCompany(companyId, query) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw ApiError.notFound('Company not found');
    }
    return employeeRepository.findByCompany(companyId, query);
  }

  async getByManager(managerId, query) {
    const manager = await User.findByPk(managerId);
    if (!manager) {
      throw ApiError.notFound('Manager not found');
    }
    return employeeRepository.findByManager(managerId, query);
  }

  async getByRole(role, query) {
    const validRoles = ['company_admin', 'project_manager', 'team_lead', 'developer', 'qa', 'hr'];
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest('Invalid role');
    }
    return employeeRepository.findByRole(role, query);
  }

  async generateEmployeeId() {
    const lastEmployee = await User.findOne({
      where: {
        employeeId: { [require('sequelize').Op.like]: 'EMP-%' },
      },
      order: [['createdAt', 'DESC']],
      paranoid: false,
    });

    let nextNumber = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const match = lastEmployee.employeeId.match(/EMP-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `EMP-${String(nextNumber).padStart(4, '0')}`;
  }
}

module.exports = new EmployeeService();
