import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: [],
  currentDepartment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    fetchDepartmentsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDepartmentsSuccess(state, action) {
      state.loading = false;
      state.departments = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || 0;
    },
    fetchDepartmentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDepartmentStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDepartmentSuccess(state, action) {
      state.loading = false;
      state.currentDepartment = action.payload;
    },
    fetchDepartmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createDepartmentStart(state) {
      state.loading = true;
      state.error = null;
    },
    createDepartmentSuccess(state, action) {
      state.loading = false;
      state.departments.push(action.payload);
      state.pagination.total += 1;
    },
    createDepartmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateDepartmentStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateDepartmentSuccess(state, action) {
      state.loading = false;
      const index = state.departments.findIndex((d) => d._id === action.payload._id || d.id === action.payload.id);
      if (index !== -1) state.departments[index] = action.payload;
      if (state.currentDepartment?._id === action.payload._id || state.currentDepartment?.id === action.payload.id) {
        state.currentDepartment = action.payload;
      }
    },
    updateDepartmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDepartmentStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteDepartmentSuccess(state, action) {
      state.loading = false;
      state.departments = state.departments.filter((d) => d._id !== action.payload && d.id !== action.payload);
    },
    deleteDepartmentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setDepartmentPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearCurrentDepartment(state) {
      state.currentDepartment = null;
    },
    clearDepartmentError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchDepartmentsStart,
  fetchDepartmentsSuccess,
  fetchDepartmentsFailure,
  fetchDepartmentStart,
  fetchDepartmentSuccess,
  fetchDepartmentFailure,
  createDepartmentStart,
  createDepartmentSuccess,
  createDepartmentFailure,
  updateDepartmentStart,
  updateDepartmentSuccess,
  updateDepartmentFailure,
  deleteDepartmentStart,
  deleteDepartmentSuccess,
  deleteDepartmentFailure,
  setDepartmentPage,
  clearCurrentDepartment,
  clearDepartmentError,
} = departmentSlice.actions;

export default departmentSlice.reducer;
