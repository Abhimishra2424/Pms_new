const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const milestoneController = require('../controllers/milestoneController');
const { createMilestoneRules, updateMilestoneRules } = require('../validators/milestoneValidator');

router.get('/', authenticate, milestoneController.getAll);
router.get('/:id', authenticate, milestoneController.getById);
router.post('/', authenticate, validate(createMilestoneRules), milestoneController.create);
router.put('/:id', authenticate, validate(updateMilestoneRules), milestoneController.update);
router.delete('/:id', authenticate, milestoneController.delete);

module.exports = router;
