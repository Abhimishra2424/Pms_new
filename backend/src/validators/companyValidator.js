const { body } = require('express-validator');

const createCompanyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('industry')
    .optional()
    .trim()
    .isString()
    .withMessage('Industry must be a string'),
  body('address')
    .optional()
    .trim()
    .isString()
    .withMessage('Address must be a string'),
  body('city')
    .optional()
    .trim()
    .isString()
    .withMessage('City must be a string'),
  body('state')
    .optional()
    .trim()
    .isString()
    .withMessage('State must be a string'),
  body('country')
    .optional()
    .trim()
    .isString()
    .withMessage('Country must be a string'),
  body('zipCode')
    .optional()
    .trim()
    .isString()
    .withMessage('Zip code must be a string'),
  body('taxId')
    .optional()
    .trim()
    .isString()
    .withMessage('Tax ID must be a string'),
  body('registrationNumber')
    .optional()
    .trim()
    .isString()
    .withMessage('Registration number must be a string'),
  body('size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('currency')
    .optional()
    .trim()
    .isString()
    .withMessage('Currency must be a string'),
  body('timezone')
    .optional()
    .trim()
    .isString()
    .withMessage('Timezone must be a string'),
];

const updateCompanyRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('industry')
    .optional()
    .trim()
    .isString()
    .withMessage('Industry must be a string'),
  body('address')
    .optional()
    .trim()
    .isString()
    .withMessage('Address must be a string'),
  body('city')
    .optional()
    .trim()
    .isString()
    .withMessage('City must be a string'),
  body('state')
    .optional()
    .trim()
    .isString()
    .withMessage('State must be a string'),
  body('country')
    .optional()
    .trim()
    .isString()
    .withMessage('Country must be a string'),
  body('zipCode')
    .optional()
    .trim()
    .isString()
    .withMessage('Zip code must be a string'),
  body('taxId')
    .optional()
    .trim()
    .isString()
    .withMessage('Tax ID must be a string'),
  body('registrationNumber')
    .optional()
    .trim()
    .isString()
    .withMessage('Registration number must be a string'),
  body('size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('currency')
    .optional()
    .trim()
    .isString()
    .withMessage('Currency must be a string'),
  body('timezone')
    .optional()
    .trim()
    .isString()
    .withMessage('Timezone must be a string'),
];

module.exports = {
  createCompanyRules,
  updateCompanyRules,
};
