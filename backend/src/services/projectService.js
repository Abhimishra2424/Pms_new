const { Op } = require('sequelize');
const { Project, ProjectMember, User, Company, Client, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const ProjectRepository = require('../repositories/projectRepository');

const ProjectService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      status: query.status,
      priority: query.priority,
      category: query.category,
      companyId: query.companyId,
      leadId: query.leadId,
      clientId: query.clientId,
      search: query.search,
    };
    return ProjectRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return project;
  },

  async create(data) {
    const { companyId, clientId, leadId, name } = data;

    const company = await Company.findByPk(companyId);
    if (!company) {
      throw ApiError.badRequest('Company not found');
    }

    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw ApiError.badRequest('Client not found');
      }
    }

    if (leadId) {
      const lead = await User.findByPk(leadId);
      if (!lead) {
        throw ApiError.badRequest('Lead not found');
      }
    }

    if (!data.key) {
      const initials = company.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);

      const count = await Project.count({ where: { companyId }, paranoid: false });
      data.key = `${initials}${String(count + 1).padStart(3, '0')}`;
    }

    const transaction = await sequelize.transaction();
    try {
      const project = await ProjectRepository.create(data, { transaction });
      await transaction.commit();
      return project;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async update(id, data) {
    const project = await this.getById(id);

    if (data.companyId && data.companyId !== project.companyId) {
      const company = await Company.findByPk(data.companyId);
      if (!company) {
        throw ApiError.badRequest('Company not found');
      }
    }

    if (data.clientId && data.clientId !== project.clientId) {
      const client = await Client.findByPk(data.clientId);
      if (!client) {
        throw ApiError.badRequest('Client not found');
      }
    }

    if (data.leadId && data.leadId !== project.leadId) {
      const lead = await User.findByPk(data.leadId);
      if (!lead) {
        throw ApiError.badRequest('Lead not found');
      }
    }

    const transaction = await sequelize.transaction();
    try {
      const updated = await ProjectRepository.update(id, data, { transaction });
      await transaction.commit();
      return updated;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async delete(id) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const transaction = await sequelize.transaction();
    try {
      await ProjectRepository.delete(id, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getStats(id) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return ProjectRepository.getProjectStats(id);
  },

  async getTimeline(id) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return ProjectRepository.getProjectTimeline(id);
  },
};

module.exports = ProjectService;
