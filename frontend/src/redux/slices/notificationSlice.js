import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    fetchNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, action) {
      state.loading = false;
      state.notifications = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || state.notifications.length;
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    fetchNotificationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    markAsRead(state, action) {
      const notification = state.notifications.find(
        (n) => n._id === action.payload || n.id === action.payload
      );
      if (notification) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      state.pagination.total += 1;
    },
    deleteNotification(state, action) {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload || n.id === action.payload
      );
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
        state.pagination.total -= 1;
      }
    },
    setNotificationPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination.total = 0;
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsRead,
  markAllAsRead,
  addNotification,
  deleteNotification,
  setNotificationPage,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
