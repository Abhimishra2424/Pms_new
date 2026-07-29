import axiosInstance from './axios';

export const getTasks = (params) => axiosInstance.get('/tasks', { params });

export const getTask = (id) => axiosInstance.get(`/tasks/${id}`);

export const createTask = (data) => axiosInstance.post('/tasks', data);

export const updateTask = (id, data) => axiosInstance.put(`/tasks/${id}`, data);

export const deleteTask = (id) => axiosInstance.delete(`/tasks/${id}`);

export const reorderTasks = (projectId, data) => axiosInstance.put(`/projects/${projectId}/tasks/reorder`, data);

export const getTaskComments = (taskId) => axiosInstance.get(`/tasks/${taskId}/comments`);

export const createComment = (taskId, data) => axiosInstance.post(`/tasks/${taskId}/comments`, data);

export const deleteComment = (taskId, commentId) => axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}`);

export const getTaskHistory = (taskId) => axiosInstance.get(`/tasks/${taskId}/history`);
