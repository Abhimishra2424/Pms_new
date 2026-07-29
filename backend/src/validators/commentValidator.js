const { body } = require('express-validator');

const createCommentRules = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 1 }).withMessage('Content must be at least 1 character'),

  body('mentions')
    .optional()
    .isArray().withMessage('Mentions must be an array'),

  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
];

const updateCommentRules = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 1 }).withMessage('Content must be at least 1 character'),

  body('mentions')
    .optional()
    .isArray().withMessage('Mentions must be an array'),

  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
];

module.exports = { createCommentRules, updateCommentRules };
