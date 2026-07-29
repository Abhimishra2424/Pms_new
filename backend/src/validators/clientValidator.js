const { body } = require('express-validator');

const createClientRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim(),

  body('company')
    .optional()
    .trim(),

  body('website')
    .optional()
    .isURL().withMessage('Invalid website URL'),

  body('address')
    .optional()
    .trim(),
];

const updateClientRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim(),

  body('company')
    .optional()
    .trim(),

  body('website')
    .optional()
    .isURL().withMessage('Invalid website URL'),

  body('address')
    .optional()
    .trim(),
];

module.exports = { createClientRules, updateClientRules };
