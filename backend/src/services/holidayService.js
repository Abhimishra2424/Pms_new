const ApiError = require('../utils/ApiError');
const HolidayRepository = require('../repositories/holidayRepository');

const HolidayService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'date',
      sortOrder: query.sortOrder || 'ASC',
      companyId: query.companyId,
      year: query.year,
      type: query.type,
    };
    return HolidayRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const holiday = await HolidayRepository.findById(id);
    if (!holiday) {
      throw ApiError.notFound('Holiday not found');
    }
    return holiday;
  },

  async create(data) {
    const date = new Date(data.date);
    const year = date.getFullYear();
    const dateStr = data.date.split('T')[0] || data.date;

    const existing = await HolidayRepository.findByCompanyAndDate(data.companyId, dateStr);
    if (existing) {
      throw ApiError.badRequest('Holiday already exists for this date');
    }

    return HolidayRepository.create({
      companyId: data.companyId,
      name: data.name,
      date: dateStr,
      type: data.type || 'public',
      year,
      description: data.description || null,
    });
  },

  async update(id, data) {
    const holiday = await this.getById(id);

    if (data.date) {
      const dateStr = data.date.split('T')[0] || data.date;
      data.year = new Date(data.date).getFullYear();

      if (dateStr !== holiday.date) {
        const existing = await HolidayRepository.findByCompanyAndDate(
          data.companyId || holiday.companyId,
          dateStr
        );
        if (existing && existing.id !== id) {
          throw ApiError.badRequest('Holiday already exists for this date');
        }
      }
      data.date = dateStr;
    }

    const updated = await HolidayRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Holiday not found');
    }
    return updated;
  },

  async delete(id) {
    const holiday = await HolidayRepository.findById(id);
    if (!holiday) {
      throw ApiError.notFound('Holiday not found');
    }
    await HolidayRepository.delete(id);
    return true;
  },

  async getByYear(companyId, year) {
    return HolidayRepository.findByCompanyAndYear(companyId, year);
  },
};

module.exports = HolidayService;
