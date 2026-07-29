const { sequelize, Wiki: WikiModel } = require('../models');
const ApiError = require('../utils/ApiError');
const Helpers = require('../utils/helpers');
const WikiRepository = require('../repositories/wikiRepository');

const WikiService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      projectId: query.projectId,
      parentId: query.parentId,
      companyId: query.companyId,
      isPublished: query.isPublished,
    };
    return WikiRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const page = await WikiRepository.findById(id);
    if (!page) {
      throw ApiError.notFound('Wiki page not found');
    }
    return page;
  },

  async create(data, userId) {
    let slug = Helpers.slugify(data.title);

    const existing = await WikiRepository.findBySlug(slug, data.projectId);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const maxSortOrder = await WikiModel.max('sortOrder', {
      where: { projectId: data.projectId || null, parentId: data.parentId || null },
    });

    const page = await WikiRepository.create({
      ...data,
      slug,
      authorId: userId,
      sortOrder: (maxSortOrder || 0) + 1,
    });

    return WikiRepository.findById(page.id);
  },

  async update(id, data) {
    const page = await this.getById(id);

    if (data.title && data.title !== page.title) {
      let slug = Helpers.slugify(data.title);
      const existing = await WikiRepository.findBySlug(slug, page.projectId);
      if (existing && existing.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      data.slug = slug;
    }

    await WikiRepository.update(id, data);
    return WikiRepository.findById(id);
  },

  async delete(id) {
    const page = await WikiModel.findByPk(id);
    if (!page) {
      throw ApiError.notFound('Wiki page not found');
    }

    await WikiModel.update({ parentId: null }, { where: { parentId: id } });

    return WikiRepository.delete(id);
  },

  async getTree(projectId) {
    return WikiRepository.getTree(projectId);
  },
};

module.exports = WikiService;
