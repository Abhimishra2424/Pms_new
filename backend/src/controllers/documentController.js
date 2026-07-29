const path = require('path');
const DocumentService = require('../services/documentService');
const ApiResponse = require('../utils/ApiResponse');

const documentController = {
  async create(req, res, next) {
    try {
      const document = await DocumentService.create(
        { ...req.body, companyId: req.user.companyId },
        req.user.id,
        req.file
      );
      return ApiResponse.success(res, { document }, 'Document created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await DocumentService.getAll({ ...req.query, companyId: req.user.companyId });
      return ApiResponse.success(res, {
        documents: result.documents,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Documents fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const document = await DocumentService.getById(req.params.id);
      return ApiResponse.success(res, { document }, 'Document fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const document = await DocumentService.update(req.params.id, req.body);
      return ApiResponse.success(res, { document }, 'Document updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await DocumentService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async upload(req, res, next) {
    try {
      const document = await DocumentService.upload(
        { ...req.body, companyId: req.user.companyId },
        req.user.id,
        req.file
      );
      return ApiResponse.success(res, { document }, 'Document uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async download(req, res, next) {
    try {
      const { document, filepath } = await DocumentService.download(req.params.id);
      const filename = document.name + path.extname(filepath);
      res.download(filepath, filename);
    } catch (error) {
      next(error);
    }
  },

  async getByFolder(req, res, next) {
    try {
      const documents = await DocumentService.getByFolder(req.params.folderId);
      return ApiResponse.success(res, { documents }, 'Documents fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = documentController;
