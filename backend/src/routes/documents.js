const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../middleware/upload');
const documentController = require('../controllers/documentController');
const { createDocumentRules, updateDocumentRules } = require('../validators/documentValidator');

router.get('/', authenticate, documentController.getAll);
router.get('/folder/:folderId', authenticate, documentController.getByFolder);
router.get('/download/:id', authenticate, documentController.download);
router.get('/:id', authenticate, documentController.getById);

router.post('/', authenticate, validate(createDocumentRules), documentController.create);
router.post('/upload', authenticate, upload.single('file'), documentController.upload);

router.put('/:id', authenticate, validate(updateDocumentRules), documentController.update);
router.delete('/:id', authenticate, documentController.delete);

module.exports = router;
