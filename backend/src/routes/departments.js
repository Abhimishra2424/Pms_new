const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDepartmentRules, updateDepartmentRules } = require('../validators/departmentValidator');
const departmentController = require('../controllers/departmentController');

router.get('/', authenticate, departmentController.getAll);
router.get('/:id', authenticate, departmentController.getById);
router.post('/', authenticate, validate(createDepartmentRules), departmentController.create);
router.put('/:id', authenticate, validate(updateDepartmentRules), departmentController.update);
router.delete('/:id', authenticate, departmentController.delete);

module.exports = router;
