const { body } = require('express-validator');

const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['draft', 'published', 'archived'];

const createAnnouncementRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),

  body('priority')
    .optional()
    .isIn(priorities).withMessage('Invalid priority'),

  body('status')
    .optional()
    .isIn(statuses).withMessage('Invalid status'),

  body('targetAudience')
    .optional()
    .isArray().withMessage('Target audience must be an array'),
];

const updateAnnouncementRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('content')
    .optional()
    .trim(),

  body('priority')
    .optional()
    .isIn(priorities).withMessage('Invalid priority'),

  body('status')
    .optional()
    .isIn(statuses).withMessage('Invalid status'),

  body('targetAudience')
    .optional()
    .isArray().withMessage('Target audience must be an array'),
];

module.exports = { createAnnouncementRules, updateAnnouncementRules };
