const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const invoiceController = require('../controllers/invoiceController');
const { createInvoiceRules, updateInvoiceRules } = require('../validators/invoiceValidator');

router.get('/', authenticate, invoiceController.getAll);
router.get('/client/:clientId', authenticate, invoiceController.getByClient);
router.get('/:id', authenticate, invoiceController.getById);
router.get('/:id/pdf', authenticate, invoiceController.generatePdf);

router.post('/', authenticate, validate(createInvoiceRules), invoiceController.create);
router.post('/:id/send', authenticate, invoiceController.sendInvoice);
router.post('/:id/mark-paid', authenticate, invoiceController.markAsPaid);

router.put('/:id', authenticate, validate(updateInvoiceRules), invoiceController.update);
router.delete('/:id', authenticate, invoiceController.delete);

module.exports = router;
