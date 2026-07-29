const { Op } = require('sequelize');
const { KnowledgeBase, User, Company, Project } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const KnowledgeBaseRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      search, category, tags, companyId, projectId, isPublished,
    } = query;

    const where = {};
    if (category) where.category = category;
    if (companyId) where.companyId = companyId;
    if (projectId) where.projectId = projectId;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true' || isPublished === true;

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { [Op.overlap]: tagArray };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'views', 'publishedAt', 'category'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: articles } = await KnowledgeBase.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { articles, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return KnowledgeBase.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: userAttributes },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
      ],
    });
  },

  async findBySlug(slug) {
    return KnowledgeBase.findOne({
      where: { slug },
      include: [
        { model: User, as: 'author', attributes: userAttributes },
      ],
    });
  },

  async findByCategory(category, companyId) {
    const where = { category };
    if (companyId) where.companyId = companyId;

    return KnowledgeBase.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
      ],
      order: [['publishedAt', 'DESC']],
    });
  },

  async findByTag(tag, companyId) {
    const where = { tags: { [Op.contains]: [tag] } };
    if (companyId) where.companyId = companyId;

    return KnowledgeBase.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
      ],
      order: [['publishedAt', 'DESC']],
    });
  },

  async search(query, companyId) {
    const where = {
      companyId,
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } },
        { excerpt: { [Op.iLike]: `%${query}%` } },
      ],
    };

    return KnowledgeBase.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: userAttributes },
      ],
      order: [['views', 'DESC']],
    });
  },

  async create(data, options) {
    return KnowledgeBase.create(data, options);
  },

  async update(id, data, options) {
    const article = await KnowledgeBase.findByPk(id);
    if (!article) return null;
    await article.update(data, options);
    return article;
  },

  async delete(id, options) {
    const article = await KnowledgeBase.findByPk(id);
    if (!article) return false;
    await article.destroy(options);
    return true;
  },

  async incrementViews(id) {
    await KnowledgeBase.increment('views', { by: 1, where: { id } });
  },
};

module.exports = KnowledgeBaseRepository;
