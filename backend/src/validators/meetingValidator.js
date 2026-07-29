const { body } = require('express-validator');

const meetingStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled', 'rescheduled'];

const createMeetingRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 255 }).withMessage('Title must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('meetingDate')
    .notEmpty().withMessage('Meeting date is required')
    .isISO8601().withMessage('Invalid meeting date'),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Invalid start time format (HH:mm or HH:mm:ss)'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Invalid end time format (HH:mm or HH:mm:ss)')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(meetingStatuses).withMessage('Invalid meeting status'),

  body('meetingLink')
    .optional()
    .isURL().withMessage('Invalid meeting link URL'),

  body('location')
    .optional()
    .trim(),

  body('attendeeIds')
    .optional()
    .isArray().withMessage('Attendee IDs must be an array'),

  body('attendeeIds.*')
    .optional()
    .isUUID().withMessage('Invalid attendee ID'),
];

const updateMeetingRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Title must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim(),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('meetingDate')
    .optional()
    .isISO8601().withMessage('Invalid meeting date'),

  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Invalid start time format'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/).withMessage('Invalid end time format')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(meetingStatuses).withMessage('Invalid meeting status'),

  body('meetingLink')
    .optional()
    .isURL().withMessage('Invalid meeting link URL'),

  body('location')
    .optional()
    .trim(),

  body('attendeeIds')
    .optional()
    .isArray().withMessage('Attendee IDs must be an array'),

  body('attendeeIds.*')
    .optional()
    .isUUID().withMessage('Invalid attendee ID'),
];

module.exports = { createMeetingRules, updateMeetingRules };
