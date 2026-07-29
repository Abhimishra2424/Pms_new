const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const DocumentRepository = require('../repositories/documentRepository');

const DocumentService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      search: query.search,
      projectId: query.projectId,
      folderId: query.folderId,
      fileType: query.fileType,
      companyId: query.companyId,
      isPublic: query.isPublic,
    };
    return DocumentRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const document = await DocumentRepository.findById(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }
    return document;
  },

  async create(data, userId, file) {
    let fileData = {};

    if (file) {
      fileData = {
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
      };
    }

    const document = await DocumentRepository.create({
      ...data,
      ...fileData,
      uploadedBy: userId,
    });

    return DocumentRepository.findById(document.id);
  },

  async update(id, data) {
    const document = await this.getById(id);
    await DocumentRepository.update(id, data);
    return DocumentRepository.findById(id);
  },

  async delete(id) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    if (document.fileUrl) {
      const filepath = path.join(__dirname, '..', '..', document.fileUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return DocumentRepository.delete(id);
  },

  async getByFolder(folderId) {
    return DocumentRepository.findByFolder(folderId);
  },

  async upload(data, userId, file) {
    if (!file) {
      throw ApiError.badRequest('File is required');
    }

    return this.create(data, userId, file);
  },

  async download(id) {
    const document = await this.getById(id);

    if (!document.fileUrl) {
      throw ApiError.badRequest('No file associated with this document');
    }

    const filepath = path.join(__dirname, '..', '..', document.fileUrl);
    if (!fs.existsSync(filepath)) {
      throw ApiError.notFound('File not found on server');
    }

    return { document, filepath };
  },
};

module.exports = DocumentService;
