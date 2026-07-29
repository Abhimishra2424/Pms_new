import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  members: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    departmentId: '',
    clientId: '',
    dateRange: [null, null],
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    fetchProjectsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProjectsSuccess(state, action) {
      state.loading = false;
      state.projects = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || (action.payload.data && action.payload.total) || 0;
      state.pagination.page = action.payload.page || state.pagination.page;
      state.pagination.limit = action.payload.limit || state.pagination.limit;
    },
    fetchProjectsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProjectSuccess(state, action) {
      state.loading = false;
      state.currentProject = action.payload;
    },
    fetchProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    createProjectSuccess(state, action) {
      state.loading = false;
      state.projects.unshift(action.payload);
    },
    createProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateProjectSuccess(state, action) {
      state.loading = false;
      const index = state.projects.findIndex((p) => p._id === action.payload._id || p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject && (state.currentProject._id === action.payload._id || state.currentProject.id === action.payload.id)) {
        state.currentProject = action.payload;
      }
    },
    updateProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteProjectSuccess(state, action) {
      state.loading = false;
      state.projects = state.projects.filter(
        (p) => p._id !== action.payload && p.id !== action.payload
      );
    },
    deleteProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    archiveProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    archiveProjectSuccess(state, action) {
      state.loading = false;
      const index = state.projects.findIndex((p) => p._id === action.payload._id || p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], status: 'archived' };
      }
    },
    archiveProjectFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMembersStart(state) {
      state.loading = true;
    },
    fetchMembersSuccess(state, action) {
      state.loading = false;
      state.members = action.payload;
    },
    fetchMembersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addMemberStart(state) {
      state.loading = true;
    },
    addMemberSuccess(state, action) {
      state.loading = false;
      state.members.push(action.payload);
    },
    addMemberFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    removeMemberStart(state) {
      state.loading = true;
    },
    removeMemberSuccess(state, action) {
      state.loading = false;
      state.members = state.members.filter((m) => m._id !== action.payload && m.id !== action.payload);
    },
    removeMemberFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setProjectFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setProjectPage(state, action) {
      state.pagination.page = action.payload;
    },
    setProjectSort(state, action) {
      state.sort = action.payload;
    },
    clearCurrentProject(state) {
      state.currentProject = null;
    },
    clearProjectError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  fetchProjectStart,
  fetchProjectSuccess,
  fetchProjectFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
  archiveProjectStart,
  archiveProjectSuccess,
  archiveProjectFailure,
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
  addMemberStart,
  addMemberSuccess,
  addMemberFailure,
  removeMemberStart,
  removeMemberSuccess,
  removeMemberFailure,
  setProjectFilters,
  setProjectPage,
  setProjectSort,
  clearCurrentProject,
  clearProjectError,
} = projectSlice.actions;

export default projectSlice.reducer;
