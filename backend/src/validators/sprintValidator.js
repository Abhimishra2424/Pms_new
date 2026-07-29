const { body } = require('express-validator');

const createSprintRules = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Sprint name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Sprint name must be between 2 and 200 characters'),

  body('goal')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const updateSprintRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Sprint name must be between 2 and 200 characters'),

  body('goal')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

module.exports = { createSprintRules, updateSprintRules };
