const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createEmployeeRules, updateEmployeeRules } = require('../validators/employeeValidator');
const employeeController = require('../controllers/employeeController');

router.get('/', authenticate, employeeController.getAll);
router.get('/:id', authenticate, employeeController.getById);
router.post('/', authenticate, validate(createEmployeeRules), employeeController.create);
router.put('/:id', authenticate, validate(updateEmployeeRules), employeeController.update);
router.delete('/:id', authenticate, employeeController.delete);
router.get('/department/:deptId', authenticate, employeeController.getByDepartment);
router.get('/company/:companyId', authenticate, employeeController.getByCompany);
router.get('/manager/:managerId', authenticate, employeeController.getByManager);
router.get('/role/:role', authenticate, employeeController.getByRole);

module.exports = router;
