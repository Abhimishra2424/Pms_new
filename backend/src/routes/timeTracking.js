const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const timeEntryController = require('../controllers/timeEntryController');
const { createTimeEntryRules } = require('../validators/timeEntryValidator');

router.post('/start', authenticate, validate(createTimeEntryRules), timeEntryController.start);
router.post('/:id/stop', authenticate, timeEntryController.stop);
router.get('/active', authenticate, timeEntryController.getActive);
router.post('/manual', authenticate, validate(createTimeEntryRules), timeEntryController.create);
router.get('/', authenticate, timeEntryController.getAll);
router.get('/task/:taskId', authenticate, timeEntryController.getByTask);
router.get('/weekly-report', authenticate, timeEntryController.getWeeklyReport);
router.delete('/:id', authenticate, timeEntryController.delete);

module.exports = router;
