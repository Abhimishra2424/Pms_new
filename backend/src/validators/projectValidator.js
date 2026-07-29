const { body } = require('express-validator');
const { Project } = require('../models');

const createProjectRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Project name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('key')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 }).withMessage('Project key must be between 2 and 10 characters')
    .isUppercase().withMessage('Project key must be uppercase')
    .isAlphanumeric().withMessage('Project key must contain only letters and numbers')
    .custom(async (value) => {
      const existing = await Project.findOne({ where: { key: value }, paranoid: false });
      if (existing) {
        throw new Error('Project key already exists');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('category')
    .optional()
    .isIn(['software', 'marketing', 'design', 'research', 'operations', 'other'])
    .withMessage('Invalid category'),

  body('companyId')
    .notEmpty().withMessage('Company ID is required')
    .isUUID().withMessage('Invalid company ID'),

  body('clientId')
    .optional()
    .isUUID().withMessage('Invalid client ID'),

  body('leadId')
    .optional()
    .isUUID().withMessage('Invalid lead ID'),

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

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),

  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),

  body('currency')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 }).withMessage('Invalid currency'),

  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const updateProjectRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Project name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('key')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 }).withMessage('Project key must be between 2 and 10 characters')
    .isUppercase().withMessage('Project key must be uppercase')
    .isAlphanumeric().withMessage('Project key must contain only letters and numbers')
    .custom(async (value, { req }) => {
      const existing = await Project.findOne({ where: { key: value, id: { [require('sequelize').Op.ne]: req.params.id } }, paranoid: false });
      if (existing) {
        throw new Error('Project key already exists');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived'])
    .withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('category')
    .optional()
    .isIn(['software', 'marketing', 'design', 'research', 'operations', 'other'])
    .withMessage('Invalid category'),

  body('companyId')
    .optional()
    .isUUID().withMessage('Invalid company ID'),

  body('clientId')
    .optional()
    .isUUID().withMessage('Invalid client ID'),

  body('leadId')
    .optional()
    .isUUID().withMessage('Invalid lead ID'),

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

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),

  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),

  body('currency')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 }).withMessage('Invalid currency'),

  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

module.exports = { createProjectRules, updateProjectRules };
