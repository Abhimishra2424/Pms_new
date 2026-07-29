const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const meetingController = require('../controllers/meetingController');
const { createMeetingRules, updateMeetingRules } = require('../validators/meetingValidator');

router.get('/', authenticate, meetingController.getAll);
router.get('/project/:projectId', authenticate, meetingController.getByProject);
router.get('/:id', authenticate, meetingController.getById);

router.post('/', authenticate, validate(createMeetingRules), meetingController.create);
router.put('/:id', authenticate, validate(updateMeetingRules), meetingController.update);
router.delete('/:id', authenticate, meetingController.delete);

module.exports = router;
