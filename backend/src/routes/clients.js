const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const clientController = require('../controllers/clientController');
const { createClientRules, updateClientRules } = require('../validators/clientValidator');

router.get('/', authenticate, clientController.getAll);
router.get('/:id', authenticate, clientController.getById);

router.post('/', authenticate, validate(createClientRules), clientController.create);
router.put('/:id', authenticate, validate(updateClientRules), clientController.update);
router.delete('/:id', authenticate, clientController.delete);

module.exports = router;
