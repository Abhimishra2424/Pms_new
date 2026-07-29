const { body } = require('express-validator');

const addMemberRules = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('Invalid user ID'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['manager', 'lead', 'member', 'viewer']).withMessage('Invalid role'),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
];

const updateMemberRoleRules = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['manager', 'lead', 'member', 'viewer']).withMessage('Invalid role'),
];

module.exports = { addMemberRules, updateMemberRoleRules };
