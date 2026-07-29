const KnowledgeBaseService = require('../services/knowledgeBaseService');
const ApiResponse = require('../utils/ApiResponse');

const knowledgeBaseController = {
  async create(req, res, next) {
    try {
      const article = await KnowledgeBaseService.create({ ...req.body, companyId: req.user.companyId }, req.user.id);
      return ApiResponse.success(res, { article }, 'Article created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await KnowledgeBaseService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        articles: result.articles,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Articles fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const article = await KnowledgeBaseService.getById(req.params.id);
      return ApiResponse.success(res, { article }, 'Article fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const article = await KnowledgeBaseService.update(req.params.id, req.body);
      return ApiResponse.success(res, { article }, 'Article updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await KnowledgeBaseService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Article deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req, res, next) {
    try {
      const articles = await KnowledgeBaseService.getByCategory(req.params.category, req.user.companyId);
      return ApiResponse.success(res, { articles }, 'Articles fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getByTag(req, res, next) {
    try {
      const articles = await KnowledgeBaseService.getByTag(req.params.tag, req.user.companyId);
      return ApiResponse.success(res, { articles }, 'Articles fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async search(req, res, next) {
    try {
      const articles = await KnowledgeBaseService.search(req.query.q, req.user.companyId);
      return ApiResponse.success(res, { articles }, 'Search results fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = knowledgeBaseController;
