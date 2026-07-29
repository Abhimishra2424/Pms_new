const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const announcementController = require('../controllers/announcementController');
const { createAnnouncementRules, updateAnnouncementRules } = require('../validators/announcementValidator');

router.get('/', authenticate, announcementController.getAll);
router.get('/:id', authenticate, announcementController.getById);

router.post('/', authenticate, validate(createAnnouncementRules), announcementController.create);
router.post('/:id/publish', authenticate, announcementController.publish);
router.post('/:id/archive', authenticate, announcementController.archive);

router.put('/:id', authenticate, validate(updateAnnouncementRules), announcementController.update);
router.delete('/:id', authenticate, announcementController.delete);

module.exports = router;
