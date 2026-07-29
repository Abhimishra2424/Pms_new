const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDesignationRules, updateDesignationRules } = require('../validators/designationValidator');
const designationController = require('../controllers/designationController');

router.get('/', authenticate, designationController.getAll);
router.get('/:id', authenticate, designationController.getById);
router.post('/', authenticate, validate(createDesignationRules), designationController.create);
router.put('/:id', authenticate, validate(updateDesignationRules), designationController.update);
router.delete('/:id', authenticate, designationController.delete);

module.exports = router;
