import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  designations: [],
  currentDesignation: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const designationSlice = createSlice({
  name: 'designation',
  initialState,
  reducers: {
    fetchDesignationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDesignationsSuccess(state, action) {
      state.loading = false;
      state.designations = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || 0;
    },
    fetchDesignationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDesignationStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDesignationSuccess(state, action) {
      state.loading = false;
      state.currentDesignation = action.payload;
    },
    fetchDesignationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createDesignationStart(state) {
      state.loading = true;
      state.error = null;
    },
    createDesignationSuccess(state, action) {
      state.loading = false;
      state.designations.push(action.payload);
      state.pagination.total += 1;
    },
    createDesignationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateDesignationStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateDesignationSuccess(state, action) {
      state.loading = false;
      const index = state.designations.findIndex((d) => d._id === action.payload._id || d.id === action.payload.id);
      if (index !== -1) state.designations[index] = action.payload;
      if (state.currentDesignation?._id === action.payload._id || state.currentDesignation?.id === action.payload.id) {
        state.currentDesignation = action.payload;
      }
    },
    updateDesignationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDesignationStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteDesignationSuccess(state, action) {
      state.loading = false;
      state.designations = state.designations.filter((d) => d._id !== action.payload && d.id !== action.payload);
    },
    deleteDesignationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setDesignationPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearCurrentDesignation(state) {
      state.currentDesignation = null;
    },
    clearDesignationError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchDesignationsStart,
  fetchDesignationsSuccess,
  fetchDesignationsFailure,
  fetchDesignationStart,
  fetchDesignationSuccess,
  fetchDesignationFailure,
  createDesignationStart,
  createDesignationSuccess,
  createDesignationFailure,
  updateDesignationStart,
  updateDesignationSuccess,
  updateDesignationFailure,
  deleteDesignationStart,
  deleteDesignationSuccess,
  deleteDesignationFailure,
  setDesignationPage,
  clearCurrentDesignation,
  clearDesignationError,
} = designationSlice.actions;

export default designationSlice.reducer;
