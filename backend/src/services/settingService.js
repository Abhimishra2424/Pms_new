const { Setting } = require('../models');
const ApiError = require('../utils/ApiError');

const DEFAULT_SETTINGS = {
  general: {
    company_name: { value: '', type: 'string' },
    timezone: { value: 'UTC', type: 'string' },
    currency: { value: 'USD', type: 'string' },
    date_format: { value: 'YYYY-MM-DD', type: 'string' },
    time_format: { value: '24h', type: 'string' },
    language: { value: 'en', type: 'string' },
    theme: { value: 'light', type: 'string' },
  },
  email: {
    smtp_host: { value: '', type: 'string' },
    smtp_port: { value: '587', type: 'number' },
    smtp_user: { value: '', type: 'string' },
    smtp_pass: { value: '', type: 'string' },
  },
};

const settingService = {
  async getAll(companyId) {
    const settings = await Setting.findAll({ where: { companyId } });

    const grouped = {};
    settings.forEach((setting) => {
      const group = setting.group || 'general';
      if (!grouped[group]) grouped[group] = {};
      grouped[group][setting.key] = settingService.parseValue(setting.value, setting.type);
    });

    return grouped;
  },

  async getByKey(companyId, key) {
    const setting = await Setting.findOne({ where: { companyId, key } });
    if (!setting) {
      throw ApiError.notFound(`Setting "${key}" not found`);
    }
    return {
      key: setting.key,
      value: settingService.parseValue(setting.value, setting.type),
      type: setting.type,
      group: setting.group,
    };
  },

  async update(companyId, key, value) {
    const setting = await Setting.findOne({ where: { companyId, key } });

    if (setting) {
      setting.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await setting.save();
      return setting;
    }

    const group = settingService.inferGroup(key);
    const defaultConfig = DEFAULT_SETTINGS[group]?.[key];
    const type = defaultConfig?.type || 'string';

    const newSetting = await Setting.create({
      companyId,
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type,
      group,
    });

    return newSetting;
  },

  async updateBulk(companyId, settings) {
    if (!Array.isArray(settings)) {
      throw ApiError.badRequest('Settings must be an array of {key, value}');
    }

    const results = [];
    for (const item of settings) {
      if (!item.key) continue;
      const setting = await settingService.update(companyId, item.key, item.value);
      results.push(setting);
    }

    return results;
  },

  async initializeDefaults(companyId) {
    for (const [group, keys] of Object.entries(DEFAULT_SETTINGS)) {
      for (const [key, config] of Object.entries(keys)) {
        const existing = await Setting.findOne({ where: { companyId, key } });
        if (!existing) {
          await Setting.create({
            companyId,
            key,
            value: config.value,
            type: config.type,
            group,
          });
        }
      }
    }
  },

  parseValue(value, type) {
    if (value === null || value === undefined) return value;
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === true;
      case 'json':
        try { return JSON.parse(value); } catch { return value; }
      default:
        return String(value);
    }
  },

  inferGroup(key) {
    const emailKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_encryption'];
    if (emailKeys.includes(key)) return 'email';
    return 'general';
  },
};

module.exports = settingService;
