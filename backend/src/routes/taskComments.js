const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const commentController = require('../controllers/commentController');
const { createCommentRules, updateCommentRules } = require('../validators/commentValidator');

router.get('/:taskId/comments', authenticate, commentController.getByTask);
router.post('/:taskId/comments', authenticate, validate(createCommentRules), commentController.create);
router.put('/comments/:id', authenticate, validate(updateCommentRules), commentController.update);
router.delete('/comments/:id', authenticate, commentController.delete);

module.exports = router;
