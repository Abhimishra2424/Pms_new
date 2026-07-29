import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  company: null,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    fetchCompanyStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCompanySuccess(state, action) {
      state.loading = false;
      state.company = action.payload;
    },
    fetchCompanyFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateCompanyStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateCompanySuccess(state, action) {
      state.loading = false;
      state.company = action.payload;
    },
    updateCompanyFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCompanyError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchCompanyStart,
  fetchCompanySuccess,
  fetchCompanyFailure,
  updateCompanyStart,
  updateCompanySuccess,
  updateCompanyFailure,
  clearCompanyError,
} = companySlice.actions;

export default companySlice.reducer;
