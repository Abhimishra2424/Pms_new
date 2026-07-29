const { body } = require('express-validator');

const expenseCategories = ['travel', 'office_supplies', 'software', 'hardware', 'utilities', 'meals', 'entertainment', 'other'];
const expenseStatuses = ['pending', 'approved', 'rejected'];

const createExpenseRules = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isDecimal({ min: 0.01 }).withMessage('Amount must be a positive decimal'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(expenseCategories).withMessage('Invalid expense category'),

  body('expenseDate')
    .notEmpty().withMessage('Expense date is required')
    .isISO8601().withMessage('Invalid expense date'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('receipt')
    .optional()
    .isObject().withMessage('Receipt must be an object'),

  body('isBillable')
    .optional()
    .isBoolean().withMessage('isBillable must be a boolean'),
];

const updateExpenseRules = [
  body('amount')
    .optional()
    .isDecimal({ min: 0.01 }).withMessage('Amount must be a positive decimal'),

  body('category')
    .optional()
    .isIn(expenseCategories).withMessage('Invalid expense category'),

  body('expenseDate')
    .optional()
    .isISO8601().withMessage('Invalid expense date'),

  body('description')
    .optional()
    .trim(),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('status')
    .optional()
    .isIn(expenseStatuses).withMessage('Invalid expense status'),

  body('receipt')
    .optional()
    .isObject().withMessage('Receipt must be an object'),

  body('isBillable')
    .optional()
    .isBoolean().withMessage('isBillable must be a boolean'),
];

module.exports = { createExpenseRules, updateExpenseRules };
