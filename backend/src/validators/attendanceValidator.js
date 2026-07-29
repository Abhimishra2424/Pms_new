const { body } = require('express-validator');

const createAttendanceRules = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('Invalid user ID'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date'),

  body('clockIn')
    .notEmpty().withMessage('Clock in time is required')
    .isISO8601().withMessage('Invalid clock in time'),

  body('clockOut')
    .optional()
    .isISO8601().withMessage('Invalid clock out time')
    .custom((value, { req }) => {
      if (value && req.body.clockIn && new Date(value) <= new Date(req.body.clockIn)) {
        throw new Error('Clock out must be after clock in');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['present', 'absent', 'late', 'half_day', 'wfh', 'on_leave'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim(),
];

const updateAttendanceRules = [
  body('clockIn')
    .optional()
    .isISO8601().withMessage('Invalid clock in time'),

  body('clockOut')
    .optional()
    .isISO8601().withMessage('Invalid clock out time')
    .custom((value, { req }) => {
      if (value && req.body.clockIn && new Date(value) <= new Date(req.body.clockIn)) {
        throw new Error('Clock out must be after clock in');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['present', 'absent', 'late', 'half_day', 'wfh', 'on_leave'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim(),
];

module.exports = { createAttendanceRules, updateAttendanceRules };
