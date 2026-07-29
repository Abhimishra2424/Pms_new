const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const { createArticleRules, updateArticleRules } = require('../validators/knowledgeBaseValidator');

router.get('/', authenticate, knowledgeBaseController.getAll);
router.get('/search', authenticate, knowledgeBaseController.search);
router.get('/category/:category', authenticate, knowledgeBaseController.getByCategory);
router.get('/tag/:tag', authenticate, knowledgeBaseController.getByTag);
router.get('/:id', authenticate, knowledgeBaseController.getById);

router.post('/', authenticate, validate(createArticleRules), knowledgeBaseController.create);
router.put('/:id', authenticate, validate(updateArticleRules), knowledgeBaseController.update);
router.delete('/:id', authenticate, knowledgeBaseController.delete);

module.exports = router;
