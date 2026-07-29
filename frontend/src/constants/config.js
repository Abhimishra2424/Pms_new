export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ProjectPro';

export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
  DATE_TIME: 'DD/MM/YYYY hh:mm A',
  ISO: 'YYYY-MM-DD',
  ISO_DATE_TIME: 'YYYY-MM-DDTHH:mm:ss',
  MONTH_YEAR: 'MMM YYYY',
  DAY_MONTH: 'DD MMM',
  RELATIVE: 'relative',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  ACCEPTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  MAX_FILE_COUNT: 10,
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'app_theme',
  SIDEBAR_STATE: 'sidebar_state',
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  TASK_UPDATED: 'task:updated',
  TASK_CREATED: 'task:created',
  TASK_DELETED: 'task:deleted',
  PROJECT_UPDATED: 'project:updated',
  COMMENT_ADDED: 'comment:added',
  MESSAGE: 'message',
  TYPING: 'typing',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};

export const CHART_COLORS = [
  '#1976d2',
  '#dc004e',
  '#388e3c',
  '#f57c00',
  '#7b1fa2',
  '#0097a7',
  '#c2185b',
  '#512da8',
  '#00796b',
  '#e64a19',
];
