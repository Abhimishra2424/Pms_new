const { Op } = require('sequelize');
const { Document, User, Project, Company } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const DocumentRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      search, projectId, folderId, fileType, companyId, isPublic,
    } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (folderId) where.folderId = folderId;
    if (fileType) where.fileType = fileType;
    if (companyId) where.companyId = companyId;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true' || isPublic === true;

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'fileType', 'fileSize'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: documents } = await Document.findAndCountAll({
      where,
      include: [
        { model: User, as: 'uploadedByUser', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Document, as: 'parent', attributes: ['id', 'name'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { documents, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Document.findByPk(id, {
      include: [
        { model: User, as: 'uploadedByUser', attributes: userAttributes },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Document, as: 'parent', attributes: ['id', 'name'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
      ],
    });
  },

  async findByFolder(folderId) {
    return Document.findAll({
      where: { folderId },
      include: [
        { model: User, as: 'uploadedByUser', attributes: userAttributes },
        { model: Document, as: 'parent', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
    });
  },

  async create(data, options) {
    return Document.create(data, options);
  },

  async update(id, data, options) {
    const document = await Document.findByPk(id);
    if (!document) return null;
    await document.update(data, options);
    return document;
  },

  async delete(id, options) {
    const document = await Document.findByPk(id);
    if (!document) return false;
    await document.destroy(options);
    return true;
  },
};

module.exports = DocumentRepository;
