const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const InvoiceRepository = require('../repositories/invoiceRepository');
const ClientRepository = require('../repositories/clientRepository');

const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'overdue', 'cancelled'],
  paid: ['refunded'],
  overdue: ['paid', 'cancelled'],
  cancelled: [],
  refunded: [],
};

const InvoiceService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      clientId: query.clientId,
      companyId: query.companyId,
      status: query.status,
      issueDateFrom: query.issueDateFrom,
      issueDateTo: query.issueDateTo,
      dueDateFrom: query.dueDateFrom,
      dueDateTo: query.dueDateTo,
      search: query.search,
    };
    return InvoiceRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const invoice = await InvoiceRepository.findById(id);
    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }
    return invoice;
  },

  async create(data) {
    const { items, taxRate = 0, discountType, discountValue = 0, ...invoiceData } = data;

    const client = await ClientRepository.findById(invoiceData.clientId);
    if (!client) {
      throw ApiError.badRequest('Client not found');
    }

    if (!items || items.length === 0) {
      throw ApiError.badRequest('Invoice must have at least one item');
    }

    let subtotal = 0;
    const invoiceItems = items.map((item) => {
      const total = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      subtotal += total;
      return {
        description: item.description,
        quantity: parseInt(item.quantity, 10),
        unitPrice: parseFloat(item.unitPrice),
        total: parseFloat(total.toFixed(2)),
      };
    });

    subtotal = parseFloat(subtotal.toFixed(2));

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = parseFloat((subtotal * (parseFloat(discountValue) / 100)).toFixed(2));
    } else if (discountType === 'fixed') {
      discountAmount = parseFloat(parseFloat(discountValue).toFixed(2));
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = parseFloat((taxableAmount * (parseFloat(taxRate) / 100)).toFixed(2));
    const total = parseFloat((taxableAmount + taxAmount).toFixed(2));

    const invoiceNumber = await this._generateInvoiceNumber(invoiceData.companyId);

    const transaction = await sequelize.transaction();
    try {
      const invoice = await InvoiceRepository.create(
        {
          ...invoiceData,
          invoiceNumber,
          subtotal,
          taxRate: parseFloat(taxRate),
          taxAmount,
          discountType: discountType || null,
          discountValue: discountValue ? parseFloat(discountValue) : 0,
          discountAmount,
          total,
          amountPaid: 0,
          balanceDue: total,
        },
        { transaction }
      );

      const createdItems = invoiceItems.map((item) => ({
        ...item,
        invoiceId: invoice.id,
      }));
      await InvoiceRepository.bulkCreateItems(createdItems, { transaction });

      await transaction.commit();
      return InvoiceRepository.findById(invoice.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async update(id, data) {
    const invoice = await this.getById(id);

    if (invoice.status !== 'draft') {
      throw ApiError.badRequest('Only draft invoices can be edited');
    }

    const { items, taxRate, discountType, discountValue, ...invoiceData } = data;

    const transaction = await sequelize.transaction();
    try {
      await InvoiceRepository.update(id, invoiceData, { transaction });

      if (items !== undefined) {
        await InvoiceRepository.removeItems(id, { transaction });

        if (items.length > 0) {
          let subtotal = 0;
          const invoiceItems = items.map((item) => {
            const total = parseFloat(item.quantity) * parseFloat(item.unitPrice);
            subtotal += total;
            return {
              invoiceId: id,
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(total.toFixed(2)),
            };
          });

          subtotal = parseFloat(subtotal.toFixed(2));

          const rate = taxRate !== undefined ? parseFloat(taxRate) : parseFloat(invoice.taxRate || 0);
          const discType = discountType !== undefined ? discountType : invoice.discountType;
          const discValue = discountValue !== undefined ? parseFloat(discountValue) : parseFloat(invoice.discountValue || 0);

          let discountAmount = 0;
          if (discType === 'percentage') {
            discountAmount = parseFloat((subtotal * (discValue / 100)).toFixed(2));
          } else if (discType === 'fixed') {
            discountAmount = discValue;
          }

          const taxableAmount = subtotal - discountAmount;
          const taxAmt = parseFloat((taxableAmount * (rate / 100)).toFixed(2));
          const total = parseFloat((taxableAmount + taxAmt).toFixed(2));

          await InvoiceRepository.update(id, {
            subtotal,
            taxRate: rate,
            taxAmount: taxAmt,
            discountType: discType || null,
            discountValue: discValue,
            discountAmount,
            total,
            balanceDue: total - parseFloat(invoice.amountPaid || 0),
          }, { transaction });

          await InvoiceRepository.bulkCreateItems(invoiceItems, { transaction });
        }
      }

      await transaction.commit();
      return InvoiceRepository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async delete(id) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }
    if (invoice.status !== 'draft') {
      throw ApiError.badRequest('Only draft invoices can be deleted');
    }
    return InvoiceRepository.delete(id);
  },

  async getByClient(clientId) {
    return InvoiceRepository.findByClient(clientId);
  },

  async markAsPaid(id, amount) {
    const invoice = await this.getById(id);

    if (invoice.status === 'paid') {
      throw ApiError.badRequest('Invoice is already paid');
    }

    if (invoice.status === 'cancelled' || invoice.status === 'refunded') {
      throw ApiError.badRequest('Cannot mark a cancelled or refunded invoice as paid');
    }

    const amountPaid = parseFloat(invoice.amountPaid || 0) + parseFloat(amount || invoice.balanceDue);
    const balanceDue = parseFloat((parseFloat(invoice.total) - amountPaid).toFixed(2));

    const updateData = {
      amountPaid: parseFloat(amountPaid.toFixed(2)),
      balanceDue: parseFloat(balanceDue.toFixed(2)),
      status: balanceDue <= 0 ? 'paid' : 'sent',
    };

    await InvoiceRepository.update(id, updateData);
    return InvoiceRepository.findById(id);
  },

  async sendInvoice(id) {
    const invoice = await this.getById(id);

    if (invoice.status !== 'draft') {
      throw ApiError.badRequest('Invoice has already been sent');
    }

    await InvoiceRepository.update(id, { status: 'sent' });

    return InvoiceRepository.findById(id);
  },

  async generatePdf(id) {
    const invoice = await this.getById(id);
    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }
    return invoice;
  },

  async _generateInvoiceNumber(companyId) {
    const year = new Date().getFullYear();
    const lastInvoice = await InvoiceRepository.findAll({
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      companyId,
    });

    let nextNumber = 1;
    if (lastInvoice.invoices.length > 0) {
      const lastNumber = lastInvoice.invoices[0].invoiceNumber;
      const match = lastNumber.match(/INV-(\d{4})-(\d{4})/);
      if (match && parseInt(match[1], 10) === year) {
        nextNumber = parseInt(match[2], 10) + 1;
      }
    }

    return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
  },

  _validateStatusTransition(currentStatus, newStatus) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw ApiError.badRequest(`Cannot transition from "${currentStatus}" to "${newStatus}"`);
    }
  },
};

module.exports = InvoiceService;
