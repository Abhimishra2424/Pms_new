const { body } = require('express-validator');

const createHolidayRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Holiday name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Holiday name must be between 2 and 200 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date'),

  body('type')
    .optional()
    .isIn(['public', 'company', 'optional']).withMessage('Invalid holiday type'),

  body('description')
    .optional()
    .trim(),
];

const updateHolidayRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Holiday name must be between 2 and 200 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date'),

  body('type')
    .optional()
    .isIn(['public', 'company', 'optional']).withMessage('Invalid holiday type'),

  body('description')
    .optional()
    .trim(),
];

module.exports = { createHolidayRules, updateHolidayRules };
