import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.permissions = action.payload.permissions || [];
      state.error = null;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logoutStart(state) {
      state.loading = true;
    },
    logoutSuccess(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.permissions = [];
    },
    logoutFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    getProfileStart(state) {
      state.loading = true;
    },
    getProfileSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },
    getProfileFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    setPermissions(state, action) {
      state.permissions = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setTokens(state, action) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || state.refreshToken;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  getProfileStart,
  getProfileSuccess,
  getProfileFailure,
  updateUser,
  setPermissions,
  clearError,
  setTokens,
} = authSlice.actions;

export default authSlice.reducer;
