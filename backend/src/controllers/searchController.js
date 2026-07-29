const searchService = require('../services/searchService');
const ApiResponse = require('../utils/ApiResponse');

const searchController = {
  async globalSearch(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return ApiResponse.success(res, {
          projects: [], tasks: [], employees: [], documents: [], knowledgeBase: [],
        }, 'No search query provided');
      }

      const results = await searchService.globalSearch(q, req.user.companyId);
      return ApiResponse.success(res, results, 'Search results fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = searchController;
