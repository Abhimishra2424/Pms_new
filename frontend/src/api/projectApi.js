import axiosInstance from './axios';

export const getProjects = (params) => axiosInstance.get('/projects', { params });

export const getProject = (id) => axiosInstance.get(`/projects/${id}`);

export const createProject = (data) => axiosInstance.post('/projects', data);

export const updateProject = (id, data) => axiosInstance.put(`/projects/${id}`, data);

export const deleteProject = (id) => axiosInstance.delete(`/projects/${id}`);

export const archiveProject = (id) => axiosInstance.patch(`/projects/${id}/archive`);

export const getProjectMembers = (projectId) => axiosInstance.get(`/projects/${projectId}/members`);

export const addMember = (projectId, data) => axiosInstance.post(`/projects/${projectId}/members`, data);

export const removeMember = (projectId, userId) => axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
