import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { DATE_FORMATS } from '../constants/config';

dayjs.extend(relativeTime);
dayjs.extend(utc);

export function formatDate(date, format = DATE_FORMATS.DISPLAY) {
  if (!date) return '';
  return dayjs(date).format(format);
}

export function formatDateTime(date, format = DATE_FORMATS.DISPLAY_TIME) {
  if (!date) return '';
  return dayjs(date).format(format);
}

export function formatRelativeTime(date) {
  if (!date) return '';
  return dayjs(date).fromNow();
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function generateAvatarColor(name) {
  if (!name) return '#1976d2';
  const colors = [
    '#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2',
    '#0097a7', '#c2185b', '#512da8', '#00796b', '#e64a19',
    '#d32f2f', '#0288d1', '#689f38', '#ef6c00', '#8e24aa',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getStatusColor(status, statusMap) {
  if (!status || !statusMap) return 'default';
  const statusConfig = Object.values(statusMap).find((s) => s.value === status);
  return statusConfig?.color || 'default';
}

export function getPriorityColor(priority) {
  const colorMap = {
    lowest: 'default',
    low: 'info',
    medium: 'warning',
    high: 'error',
    highest: 'error',
  };
  return colorMap[priority] || 'default';
}

export function classNames(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}

export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

export function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function nestedValue(obj, path, defaultValue = undefined) {
  if (!obj || !path) return defaultValue;
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue;
    result = result[key];
  }
  return result !== undefined ? result : defaultValue;
}

export function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function isObjectEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj && key in obj) acc[key] = obj[key];
    return acc;
  }, {});
}

export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
