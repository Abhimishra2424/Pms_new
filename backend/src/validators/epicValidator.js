const { body } = require('express-validator');

const createEpicRules = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Epic name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Epic name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date'),
];

const updateEpicRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Epic name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date'),
];

module.exports = { createEpicRules, updateEpicRules };
