const TaskService = require('../services/taskService');
const ApiResponse = require('../utils/ApiResponse');

const taskController = {
  async create(req, res, next) {
    try {
      const task = await TaskService.create(req.body, req.user.id);
      return ApiResponse.success(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await TaskService.getAll(req.query);
      return ApiResponse.success(res, {
        tasks: result.tasks,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      }, 'Tasks fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const task = await TaskService.getById(req.params.id);
      return ApiResponse.success(res, { task }, 'Task fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const task = await TaskService.update(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await TaskService.delete(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getBoard(req, res, next) {
    try {
      const board = await TaskService.getBoard(req.params.projectId);
      return ApiResponse.success(res, { board }, 'Board fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      await TaskService.reorderTasks(req.body.projectId, req.body.tasks, req.user.id);
      return ApiResponse.success(res, null, 'Tasks reordered successfully');
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await TaskService.getTaskStats(req.params.projectId);
      return ApiResponse.success(res, { stats }, 'Task stats fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async addChecklist(req, res, next) {
    try {
      const items = await TaskService.addChecklist(req.params.id, req.body.items, req.user.id);
      return ApiResponse.success(res, { items }, 'Checklist items added successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateChecklistItem(req, res, next) {
    try {
      const item = await TaskService.updateChecklistItem(req.params.itemId, req.body, req.user.id);
      return ApiResponse.success(res, { item }, 'Checklist item updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteChecklistItem(req, res, next) {
    try {
      await TaskService.deleteChecklistItem(req.params.itemId, req.user.id);
      return ApiResponse.success(res, null, 'Checklist item deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async addDependency(req, res, next) {
    try {
      const dependency = await TaskService.addDependency(
        req.params.id, req.body.dependsOnId, req.body.type, req.user.id
      );
      return ApiResponse.success(res, { dependency }, 'Dependency added successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async removeDependency(req, res, next) {
    try {
      await TaskService.removeDependency(req.params.depId, req.user.id);
      return ApiResponse.success(res, null, 'Dependency removed successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;
