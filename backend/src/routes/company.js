const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCompanyRules, updateCompanyRules } = require('../validators/companyValidator');
const companyController = require('../controllers/companyController');

router.get('/', authenticate, companyController.getAll);
router.get('/:id', authenticate, companyController.getById);
router.post('/', authenticate, validate(createCompanyRules), companyController.create);
router.put('/:id', authenticate, validate(updateCompanyRules), companyController.update);
router.delete('/:id', authenticate, companyController.delete);

module.exports = router;
