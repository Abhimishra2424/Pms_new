const { body } = require('express-validator');

const discountTypes = ['percentage', 'fixed'];
const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'];

const createInvoiceRules = [
  body('clientId')
    .notEmpty().withMessage('Client ID is required')
    .isUUID().withMessage('Invalid client ID'),

  body('issueDate')
    .notEmpty().withMessage('Issue date is required')
    .isISO8601().withMessage('Invalid issue date'),

  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid due date')
    .custom((dueDate, { req }) => {
      if (req.body.issueDate && new Date(dueDate) <= new Date(req.body.issueDate)) {
        throw new Error('Due date must be after issue date');
      }
      return true;
    }),

  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.description')
    .trim()
    .notEmpty().withMessage('Item description is required'),

  body('items.*.quantity')
    .notEmpty().withMessage('Item quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

  body('items.*.unitPrice')
    .notEmpty().withMessage('Item unit price is required')
    .isDecimal({ min: 0.01 }).withMessage('Unit price must be a positive decimal'),

  body('taxRate')
    .optional()
    .isDecimal({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),

  body('discountType')
    .optional()
    .isIn(discountTypes).withMessage('Invalid discount type'),

  body('discountValue')
    .optional()
    .isDecimal({ min: 0 }).withMessage('Discount value must be a positive decimal'),

  body('status')
    .optional()
    .isIn(invoiceStatuses).withMessage('Invalid invoice status'),
];

const updateInvoiceRules = [
  body('issueDate')
    .optional()
    .isISO8601().withMessage('Invalid issue date'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date')
    .custom((dueDate, { req }) => {
      if (req.body.issueDate && new Date(dueDate) <= new Date(req.body.issueDate)) {
        throw new Error('Due date must be after issue date');
      }
      return true;
    }),

  body('items')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one item is required'),

  body('items.*.description')
    .optional()
    .trim()
    .notEmpty().withMessage('Item description is required'),

  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

  body('items.*.unitPrice')
    .optional()
    .isDecimal({ min: 0.01 }).withMessage('Unit price must be a positive decimal'),

  body('taxRate')
    .optional()
    .isDecimal({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),

  body('discountType')
    .optional()
    .isIn(discountTypes).withMessage('Invalid discount type'),

  body('discountValue')
    .optional()
    .isDecimal({ min: 0 }).withMessage('Discount value must be a positive decimal'),

  body('status')
    .optional()
    .isIn(invoiceStatuses).withMessage('Invalid invoice status'),
];

module.exports = { createInvoiceRules, updateInvoiceRules };
