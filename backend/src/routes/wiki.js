const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const wikiController = require('../controllers/wikiController');
const { createWikiRules, updateWikiRules } = require('../validators/wikiValidator');

router.get('/', authenticate, wikiController.getAll);
router.get('/tree/:projectId', authenticate, wikiController.getTree);
router.get('/:id', authenticate, wikiController.getById);

router.post('/', authenticate, validate(createWikiRules), wikiController.create);
router.put('/:id', authenticate, validate(updateWikiRules), wikiController.update);
router.delete('/:id', authenticate, wikiController.delete);

module.exports = router;
