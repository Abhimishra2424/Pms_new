const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const epicController = require('../controllers/epicController');
const { createEpicRules, updateEpicRules } = require('../validators/epicValidator');

router.get('/', authenticate, epicController.getAll);
router.get('/:id', authenticate, epicController.getById);
router.post('/', authenticate, validate(createEpicRules), epicController.create);
router.put('/:id', authenticate, validate(updateEpicRules), epicController.update);
router.delete('/:id', authenticate, epicController.delete);

module.exports = router;
