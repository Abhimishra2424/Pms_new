const { body } = require('express-validator');

const applyLeaveRules = [
  body('type')
    .notEmpty().withMessage('Leave type is required')
    .isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'])
    .withMessage('Invalid leave type'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be on or after start date');
      }
      return true;
    }),

  body('reason')
    .notEmpty().withMessage('Reason is required')
    .trim()
    .isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),

  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
];

module.exports = { applyLeaveRules };
