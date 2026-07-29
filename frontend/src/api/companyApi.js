import axiosInstance from './axios';

// Company
export const getCompany = () => axiosInstance.get('/company');
export const updateCompany = (data) => axiosInstance.put('/company', data);

// Departments
export const getDepartments = (params) => axiosInstance.get('/departments', { params });
export const getDepartment = (id) => axiosInstance.get(`/departments/${id}`);
export const createDepartment = (data) => axiosInstance.post('/departments', data);
export const updateDepartment = (id, data) => axiosInstance.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => axiosInstance.delete(`/departments/${id}`);

// Designations
export const getDesignations = (params) => axiosInstance.get('/designations', { params });
export const getDesignation = (id) => axiosInstance.get(`/designations/${id}`);
export const createDesignation = (data) => axiosInstance.post('/designations', data);
export const updateDesignation = (id, data) => axiosInstance.put(`/designations/${id}`, data);
export const deleteDesignation = (id) => axiosInstance.delete(`/designations/${id}`);

// Employees
export const getEmployees = (params) => axiosInstance.get('/employees', { params });
export const getEmployee = (id) => axiosInstance.get(`/employees/${id}`);
export const createEmployee = (data) => axiosInstance.post('/employees', data);
export const updateEmployee = (id, data) => axiosInstance.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => axiosInstance.delete(`/employees/${id}`);
export const getEmployeeTimeline = (id) => axiosInstance.get(`/employees/${id}/timeline`);
