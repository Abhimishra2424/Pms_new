import axiosInstance from './axios';

export const login = (data) => axiosInstance.post('/auth/login', data);

export const register = (data) => axiosInstance.post('/auth/register', data);

export const forgotPassword = (email) => axiosInstance.post('/auth/forgot-password', { email });

export const resetPassword = (data) => axiosInstance.post('/auth/reset-password', data);

export const verifyEmail = (token) => axiosInstance.post('/auth/verify-email', { token });

export const refreshToken = (token) => axiosInstance.post('/auth/refresh-token', { refreshToken: token });

export const getProfile = () => axiosInstance.get('/auth/profile');

export const updateProfile = (data) => axiosInstance.put('/auth/profile', data);

export const changePassword = (data) => axiosInstance.put('/auth/change-password', data);

export const logout = () => axiosInstance.post('/auth/logout');
