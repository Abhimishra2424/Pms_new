const { Op } = require('sequelize');
const { Announcement, User, Company } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const AnnouncementRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      status, priority, companyId, publishedFrom, publishedTo,
    } = query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (companyId) where.companyId = companyId;

    if (publishedFrom || publishedTo) {
      where.publishedAt = {};
      if (publishedFrom) where.publishedAt[Op.gte] = new Date(publishedFrom);
      if (publishedTo) where.publishedAt[Op.lte] = new Date(publishedTo);
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'publishedAt', 'title', 'priority', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: announcements } = await Announcement.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { announcements, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Announcement.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
    });
  },

  async create(data, options) {
    return Announcement.create(data, options);
  },

  async update(id, data, options) {
    const announcement = await Announcement.findByPk(id);
    if (!announcement) return null;
    await announcement.update(data, options);
    return announcement;
  },

  async delete(id, options) {
    const announcement = await Announcement.findByPk(id);
    if (!announcement) return false;
    await announcement.destroy(options);
    return true;
  },
};

module.exports = AnnouncementRepository;
