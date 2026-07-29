const { body } = require('express-validator');

const createDepartmentRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('headId')
    .optional()
    .isUUID()
    .withMessage('Invalid head ID format'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
];

const updateDepartmentRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('headId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Invalid head ID format'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  createDepartmentRules,
  updateDepartmentRules,
};
