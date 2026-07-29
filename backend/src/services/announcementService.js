const ApiError = require('../utils/ApiError');
const AnnouncementRepository = require('../repositories/announcementRepository');

const AnnouncementService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      status: query.status,
      priority: query.priority,
      companyId: query.companyId,
      publishedFrom: query.publishedFrom,
      publishedTo: query.publishedTo,
    };
    return AnnouncementRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const announcement = await AnnouncementRepository.findById(id);
    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }
    return announcement;
  },

  async create(data, userId) {
    const announcement = await AnnouncementRepository.create({
      ...data,
      authorId: userId,
      publishedAt: data.status === 'published' ? new Date() : null,
    });
    return AnnouncementRepository.findById(announcement.id);
  },

  async update(id, data) {
    const announcement = await this.getById(id);

    if (announcement.status === 'published' && data.status && data.status !== 'archived') {
      throw ApiError.badRequest('Published announcements can only be archived');
    }

    if (data.status === 'published' && !announcement.publishedAt) {
      data.publishedAt = new Date();
    }

    await AnnouncementRepository.update(id, data);
    return AnnouncementRepository.findById(id);
  },

  async delete(id) {
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }
    return AnnouncementRepository.delete(id);
  },

  async publish(id) {
    const announcement = await this.getById(id);

    if (announcement.status === 'published') {
      throw ApiError.badRequest('Announcement is already published');
    }

    await AnnouncementRepository.update(id, {
      status: 'published',
      publishedAt: new Date(),
    });

    const updated = await AnnouncementRepository.findById(id);

    await this._sendNotifications(updated);

    return updated;
  },

  async archive(id) {
    const announcement = await this.getById(id);

    if (announcement.status === 'archived') {
      throw ApiError.badRequest('Announcement is already archived');
    }

    await AnnouncementRepository.update(id, { status: 'archived' });
    return AnnouncementRepository.findById(id);
  },

  async _sendNotifications(announcement) {
    try {
      const notifications = [];

      if (announcement.targetAudience && announcement.targetAudience.length > 0) {
        notifications.push({
          type: 'announcement',
          title: announcement.title,
          message: announcement.content?.substring(0, 200),
          announcementId: announcement.id,
          priority: announcement.priority,
          audience: announcement.targetAudience,
        });
      }

      return notifications;
    } catch (error) {
      return [];
    }
  },
};

module.exports = AnnouncementService;
