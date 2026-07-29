class PaginationHelper {
  static getPaginationOptions(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const allowedSortOrders = ['ASC', 'DESC'];
    let sortOrder = query.sortOrder ? query.sortOrder.toUpperCase() : 'DESC';
    if (!allowedSortOrders.includes(sortOrder)) {
      sortOrder = 'DESC';
    }

    const sortBy = query.sortBy || 'createdAt';

    return {
      page,
      limit,
      offset,
      sortBy,
      sortOrder,
      order: [[sortBy, sortOrder]],
    };
  }

  static getPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

module.exports = PaginationHelper;
