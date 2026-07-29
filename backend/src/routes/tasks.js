const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const taskController = require('../controllers/taskController');
const {
  createTaskRules, updateTaskRules, reorderTasksRules,
} = require('../validators/taskValidator');

router.get('/', authenticate, taskController.getAll);
router.get('/board/:projectId', authenticate, taskController.getBoard);
router.get('/stats/:projectId', authenticate, taskController.getStats);
router.get('/:id', authenticate, taskController.getById);

router.post('/', authenticate, validate(createTaskRules), taskController.create);

router.put('/reorder', authenticate, validate(reorderTasksRules), taskController.reorder);
router.put('/checklist/:itemId', authenticate, taskController.updateChecklistItem);
router.put('/:id', authenticate, validate(updateTaskRules), taskController.update);

router.delete('/checklist/:itemId', authenticate, taskController.deleteChecklistItem);
router.delete('/dependencies/:depId', authenticate, taskController.removeDependency);
router.delete('/:id', authenticate, taskController.delete);

router.post('/:id/checklist', authenticate, taskController.addChecklist);
router.post('/:id/dependencies', authenticate, taskController.addDependency);

module.exports = router;
