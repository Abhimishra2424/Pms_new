const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const ClientRepository = require('../repositories/clientRepository');

const ClientService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      companyId: query.companyId,
      isActive: query.isActive,
    };
    return ClientRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const client = await ClientRepository.findById(id);
    if (!client) {
      throw ApiError.notFound('Client not found');
    }
    return client;
  },

  async create(data) {
    const existing = await ClientRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.badRequest('A client with this email already exists');
    }

    const client = await ClientRepository.create(data);
    return ClientRepository.findById(client.id);
  },

  async update(id, data) {
    const client = await this.getById(id);

    if (data.email && data.email !== client.email) {
      const existing = await ClientRepository.findByEmail(data.email);
      if (existing) {
        throw ApiError.badRequest('A client with this email already exists');
      }
    }

    await ClientRepository.update(id, data);
    return ClientRepository.findById(id);
  },

  async delete(id) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw ApiError.notFound('Client not found');
    }
    return ClientRepository.delete(id);
  },
};

module.exports = ClientService;
