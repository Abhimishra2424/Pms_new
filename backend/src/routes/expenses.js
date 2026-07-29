const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const expenseController = require('../controllers/expenseController');
const { createExpenseRules, updateExpenseRules } = require('../validators/expenseValidator');

router.get('/', authenticate, expenseController.getAll);
router.get('/project/:projectId', authenticate, expenseController.getByProject);
router.get('/category/:category', authenticate, expenseController.getByCategory);
router.get('/:id', authenticate, expenseController.getById);

router.post('/', authenticate, validate(createExpenseRules), expenseController.create);
router.post('/:id/approve', authenticate, expenseController.approve);
router.post('/:id/reject', authenticate, expenseController.reject);

router.put('/:id', authenticate, validate(updateExpenseRules), expenseController.update);
router.delete('/:id', authenticate, expenseController.delete);

module.exports = router;
