const { Op } = require('sequelize');
const { Wiki, User, Company, Project } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const WikiRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      search, projectId, parentId, companyId, isPublished,
    } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (parentId) where.parentId = parentId;
    if (companyId) where.companyId = companyId;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true' || isPublished === true;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'sortOrder'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: pages } = await Wiki.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Wiki, as: 'parent', attributes: ['id', 'title', 'slug'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { pages, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Wiki.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Wiki, as: 'parent', attributes: ['id', 'title', 'slug'] },
      ],
    });
  },

  async findBySlug(slug, projectId) {
    const where = { slug };
    if (projectId) where.projectId = projectId;

    return Wiki.findOne({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
      ],
    });
  },

  async getTree(projectId) {
    const pages = await Wiki.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Wiki, as: 'parent', attributes: ['id', 'title', 'slug'] },
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    });

    return this._buildTree(pages);
  },

  async create(data, options) {
    return Wiki.create(data, options);
  },

  async update(id, data, options) {
    const page = await Wiki.findByPk(id);
    if (!page) return null;
    await page.update(data, options);
    return page;
  },

  async delete(id, options) {
    const page = await Wiki.findByPk(id);
    if (!page) return false;
    await page.destroy(options);
    return true;
  },

  _buildTree(pages, parentId = null) {
    return pages
      .filter((page) => page.parentId === parentId)
      .map((page) => ({
        ...page.toJSON(),
        children: this._buildTree(pages, page.id),
      }));
  },
};

module.exports = WikiRepository;
