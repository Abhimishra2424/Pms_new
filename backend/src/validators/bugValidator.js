const { body } = require('express-validator');

const createBugRules = [
  body('taskId')
    .notEmpty().withMessage('Task ID is required')
    .isUUID().withMessage('Invalid task ID'),

  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['critical', 'major', 'minor', 'trivial']).withMessage('Invalid severity'),

  body('environment')
    .optional()
    .trim(),

  body('browser')
    .optional()
    .trim(),

  body('os')
    .optional()
    .trim(),

  body('stepsToReproduce')
    .optional()
    .trim(),

  body('expectedResult')
    .optional()
    .trim(),

  body('actualResult')
    .optional()
    .trim(),

  body('screenshots')
    .optional()
    .isArray().withMessage('Screenshots must be an array'),
];

const updateBugRules = [
  body('severity')
    .optional()
    .isIn(['critical', 'major', 'minor', 'trivial']).withMessage('Invalid severity'),

  body('environment')
    .optional()
    .trim(),

  body('browser')
    .optional()
    .trim(),

  body('os')
    .optional()
    .trim(),

  body('stepsToReproduce')
    .optional()
    .trim(),

  body('expectedResult')
    .optional()
    .trim(),

  body('actualResult')
    .optional()
    .trim(),

  body('screenshots')
    .optional()
    .isArray().withMessage('Screenshots must be an array'),
];

module.exports = { createBugRules, updateBugRules };
