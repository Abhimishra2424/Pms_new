const { body } = require('express-validator');

const createWikiRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),

  body('parentId')
    .optional()
    .isUUID().withMessage('Invalid parent ID'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
];

const updateWikiRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .optional()
    .trim(),

  body('parentId')
    .optional()
    .isUUID().withMessage('Invalid parent ID'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
];

module.exports = { createWikiRules, updateWikiRules };
