const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const sprintController = require('../controllers/sprintController');
const { createSprintRules, updateSprintRules } = require('../validators/sprintValidator');

router.get('/', authenticate, sprintController.getAll);
router.get('/:id', authenticate, sprintController.getById);
router.post('/', authenticate, validate(createSprintRules), sprintController.create);
router.put('/:id', authenticate, validate(updateSprintRules), sprintController.update);
router.delete('/:id', authenticate, sprintController.delete);
router.post('/:id/start', authenticate, sprintController.startSprint);
router.post('/:id/complete', authenticate, sprintController.completeSprint);
router.get('/:id/report', authenticate, sprintController.getSprintReport);

module.exports = router;
