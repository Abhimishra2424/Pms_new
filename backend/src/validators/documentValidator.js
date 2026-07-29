const { body } = require('express-validator');

const createDocumentRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('folderId')
    .optional()
    .isUUID().withMessage('Invalid folder ID'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
];

const updateDocumentRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('folderId')
    .optional()
    .isUUID().withMessage('Invalid folder ID'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
];

module.exports = { createDocumentRules, updateDocumentRules };
