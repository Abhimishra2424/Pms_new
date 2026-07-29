const { Op } = require('sequelize');
const { Invoice, InvoiceItem, Client, Company } = require('../models');

const InvoiceRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      clientId, companyId, status, issueDateFrom, issueDateTo,
      dueDateFrom, dueDateTo, search,
    } = query;

    const where = {};
    if (clientId) where.clientId = clientId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    if (issueDateFrom || issueDateTo) {
      where.issueDate = {};
      if (issueDateFrom) where.issueDate[Op.gte] = issueDateFrom;
      if (issueDateTo) where.issueDate[Op.lte] = issueDateTo;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate[Op.gte] = dueDateFrom;
      if (dueDateTo) where.dueDate[Op.lte] = dueDateTo;
    }

    if (search) {
      where.invoiceNumber = { [Op.iLike]: `%${search}%` };
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'issueDate', 'dueDate', 'total', 'status', 'invoiceNumber'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'company'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: InvoiceItem, as: 'items' },
      ],
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { invoices, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'company', 'address', 'phone'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: InvoiceItem, as: 'items' },
      ],
    });
  },

  async findByClient(clientId) {
    return Invoice.findAll({
      where: { clientId },
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email'] },
        { model: InvoiceItem, as: 'items' },
      ],
      order: [['issueDate', 'DESC']],
    });
  },

  async findByInvoiceNumber(invoiceNumber) {
    return Invoice.findOne({ where: { invoiceNumber } });
  },

  async create(data, options) {
    return Invoice.create(data, options);
  },

  async update(id, data, options) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return null;
    await invoice.update(data, options);
    return invoice;
  },

  async delete(id, options) {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) return false;
    await invoice.destroy(options);
    return true;
  },

  async bulkCreateItems(items, options) {
    return InvoiceItem.bulkCreate(items, options);
  },

  async removeItems(invoiceId, options) {
    return InvoiceItem.destroy({ where: { invoiceId }, ...options });
  },
};

module.exports = InvoiceRepository;
