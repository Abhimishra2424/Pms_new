const { Op } = require('sequelize');
const { Client, Company } = require('../models');

const ClientRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      search, companyId, isActive, companyId: orgCompanyId,
    } = query;

    const where = {};
    if (companyId) where.companyId = companyId;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'company'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: clients } = await Client.findAndCountAll({
      where,
      include: [
        { model: Company, as: 'organization', attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { clients, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Client.findByPk(id, {
      include: [
        { model: Company, as: 'organization', attributes: ['id', 'name'] },
      ],
    });
  },

  async findByEmail(email) {
    return Client.findOne({ where: { email } });
  },

  async create(data, options) {
    return Client.create(data, options);
  },

  async update(id, data, options) {
    const client = await Client.findByPk(id);
    if (!client) return null;
    await client.update(data, options);
    return client;
  },

  async delete(id, options) {
    const client = await Client.findByPk(id);
    if (!client) return false;
    await client.destroy(options);
    return true;
  },
};

module.exports = ClientRepository;
