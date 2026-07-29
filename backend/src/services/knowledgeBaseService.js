const ApiError = require('../utils/ApiError');
const Helpers = require('../utils/helpers');
const KnowledgeBaseRepository = require('../repositories/knowledgeBaseRepository');

const KnowledgeBaseService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      category: query.category,
      tags: query.tags,
      companyId: query.companyId,
      projectId: query.projectId,
      isPublished: query.isPublished,
    };
    return KnowledgeBaseRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const article = await KnowledgeBaseRepository.findById(id);
    if (!article) {
      throw ApiError.notFound('Knowledge base article not found');
    }

    await KnowledgeBaseRepository.incrementViews(id);

    const updated = await KnowledgeBaseRepository.findById(id);
    return updated;
  },

  async create(data, userId) {
    let slug = Helpers.slugify(data.title);

    const existing = await KnowledgeBaseRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await KnowledgeBaseRepository.create({
      ...data,
      slug,
      authorId: userId,
      publishedAt: data.isPublished ? new Date() : null,
    });

    return KnowledgeBaseRepository.findById(article.id);
  },

  async update(id, data) {
    const article = await this.getById(id);

    if (data.title && data.title !== article.title) {
      let slug = Helpers.slugify(data.title);
      const existing = await KnowledgeBaseRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      data.slug = slug;
    }

    if (data.isPublished && !article.publishedAt) {
      data.publishedAt = new Date();
    }

    await KnowledgeBaseRepository.update(id, data);
    return KnowledgeBaseRepository.findById(id);
  },

  async delete(id) {
    const article = await KnowledgeBase.findByPk(id);
    if (!article) {
      throw ApiError.notFound('Knowledge base article not found');
    }
    return KnowledgeBaseRepository.delete(id);
  },

  async getByCategory(category, companyId) {
    return KnowledgeBaseRepository.findByCategory(category, companyId);
  },

  async getByTag(tag, companyId) {
    return KnowledgeBaseRepository.findByTag(tag, companyId);
  },

  async search(query, companyId) {
    if (!query) {
      throw ApiError.badRequest('Search query is required');
    }
    return KnowledgeBaseRepository.search(query, companyId);
  },
};

module.exports = KnowledgeBaseService;
