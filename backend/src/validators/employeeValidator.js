const { body } = require('express-validator');
const { User } = require('../models');

const createEmployeeRules = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['company_admin', 'project_manager', 'team_lead', 'developer', 'qa', 'hr'])
    .withMessage('Invalid role'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID format'),
  body('designationId')
    .optional()
    .isUUID()
    .withMessage('Invalid designation ID format'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('employeeId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty')
    .custom(async (employeeId) => {
      const existing = await User.findOne({ where: { employeeId } });
      if (existing) {
        throw new Error('Employee ID already in use');
      }
    }),
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .withMessage('Date of joining must be a valid date'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Invalid manager ID format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
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
];

const updateEmployeeRules = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== req.params.id) {
        throw new Error('Email already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['company_admin', 'project_manager', 'team_lead', 'developer', 'qa', 'hr'])
    .withMessage('Invalid role'),
  body('departmentId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Invalid department ID format'),
  body('designationId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Invalid designation ID format'),
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('employeeId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty')
    .custom(async (employeeId, { req }) => {
      const existing = await User.findOne({ where: { employeeId } });
      if (existing && existing.id !== req.params.id) {
        throw new Error('Employee ID already in use');
      }
    }),
  body('dateOfJoining')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of joining must be a valid date'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('managerId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Invalid manager ID format'),
  body('gender')
    .optional({ values: 'null' })
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
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
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  createEmployeeRules,
  updateEmployeeRules,
};
