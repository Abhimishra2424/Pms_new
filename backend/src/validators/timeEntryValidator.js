const { body } = require('express-validator');

const createTimeEntryRules = [
  body('taskId')
    .notEmpty().withMessage('Task ID is required')
    .isUUID().withMessage('Invalid task ID'),

  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('description')
    .optional()
    .trim(),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Invalid start time'),

  body('endTime')
    .optional()
    .isISO8601().withMessage('Invalid end time')
    .custom((value, { req }) => {
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a positive integer'),

  body('isBillable')
    .optional()
    .isBoolean().withMessage('Is billable must be a boolean'),

  body('source')
    .notEmpty().withMessage('Source is required')
    .isIn(['timer', 'manual']).withMessage('Source must be timer or manual'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date'),
];

const updateTimeEntryRules = [
  body('description')
    .optional()
    .trim(),

  body('startTime')
    .optional()
    .isISO8601().withMessage('Invalid start time'),

  body('endTime')
    .optional()
    .isISO8601().withMessage('Invalid end time')
    .custom((value, { req }) => {
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a positive integer'),

  body('isBillable')
    .optional()
    .isBoolean().withMessage('Is billable must be a boolean'),

  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date'),
];

module.exports = { createTimeEntryRules, updateTimeEntryRules };
