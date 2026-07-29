const { body } = require('express-validator');

const createArticleRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),

  body('excerpt')
    .optional()
    .trim(),

  body('category')
    .optional()
    .trim(),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
];

const updateArticleRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .optional()
    .trim(),

  body('excerpt')
    .optional()
    .trim(),

  body('category')
    .optional()
    .trim(),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
];

module.exports = { createArticleRules, updateArticleRules };
