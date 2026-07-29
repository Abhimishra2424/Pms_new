const { body } = require('express-validator');

const createDesignationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Designation title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation title must be between 2 and 100 characters'),
  body('departmentId')
    .notEmpty()
    .withMessage('Department ID is required')
    .isUUID()
    .withMessage('Invalid department ID format'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('hierarchyLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Hierarchy level must be a positive integer'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string'),
];

const updateDesignationRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation title must be between 2 and 100 characters'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID format'),
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Invalid company ID format'),
  body('hierarchyLevel')
    .optional({ values: 'null' })
    .isInt({ min: 0 })
    .withMessage('Hierarchy level must be a positive integer'),
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
  createDesignationRules,
  updateDesignationRules,
};
