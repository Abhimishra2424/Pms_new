const { body } = require('express-validator');

const createMilestoneRules = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
];

const updateMilestoneRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
];

module.exports = { createMilestoneRules, updateMilestoneRules };
