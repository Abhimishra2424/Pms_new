const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const bugController = require('../controllers/bugController');
const { createBugRules, updateBugRules } = require('../validators/bugValidator');

router.get('/', authenticate, bugController.getAll);
router.get('/:id', authenticate, bugController.getById);
router.post('/', authenticate, validate(createBugRules), bugController.create);
router.put('/:id', authenticate, validate(updateBugRules), bugController.update);
router.delete('/:id', authenticate, bugController.delete);
router.get('/project/:projectId', authenticate, bugController.getByProject);
router.get('/assignee/:assigneeId', authenticate, bugController.getByAssignee);
router.get('/severity/:severity', authenticate, bugController.getBySeverity);

module.exports = router;
