import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: '',
    departmentId: '',
    designationId: '',
    employmentType: '',
    status: '',
  },
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    fetchEmployeesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess(state, action) {
      state.loading = false;
      state.employees = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || 0;
    },
    fetchEmployeesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchEmployeeStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeeSuccess(state, action) {
      state.loading = false;
      state.currentEmployee = action.payload;
    },
    fetchEmployeeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createEmployeeStart(state) {
      state.loading = true;
      state.error = null;
    },
    createEmployeeSuccess(state, action) {
      state.loading = false;
      state.employees.unshift(action.payload);
      state.pagination.total += 1;
    },
    createEmployeeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateEmployeeStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateEmployeeSuccess(state, action) {
      state.loading = false;
      const index = state.employees.findIndex((e) => e._id === action.payload._id || e.id === action.payload.id);
      if (index !== -1) state.employees[index] = action.payload;
      if (state.currentEmployee?._id === action.payload._id || state.currentEmployee?.id === action.payload.id) {
        state.currentEmployee = action.payload;
      }
    },
    updateEmployeeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteEmployeeStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteEmployeeSuccess(state, action) {
      state.loading = false;
      state.employees = state.employees.filter((e) => e._id !== action.payload && e.id !== action.payload);
    },
    deleteEmployeeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setEmployeeFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setEmployeePage(state, action) {
      state.pagination.page = action.payload;
    },
    clearCurrentEmployee(state) {
      state.currentEmployee = null;
    },
    clearEmployeeError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,
  fetchEmployeeStart,
  fetchEmployeeSuccess,
  fetchEmployeeFailure,
  createEmployeeStart,
  createEmployeeSuccess,
  createEmployeeFailure,
  updateEmployeeStart,
  updateEmployeeSuccess,
  updateEmployeeFailure,
  deleteEmployeeStart,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,
  setEmployeeFilters,
  setEmployeePage,
  clearCurrentEmployee,
  clearEmployeeError,
} = employeeSlice.actions;

export default employeeSlice.reducer;
