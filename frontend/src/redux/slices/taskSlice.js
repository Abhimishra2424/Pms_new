import { createSlice } from '@reduxjs/toolkit';
import { TASK_STATUS } from '../../constants/status';

const initialBoardView = {};
Object.values(TASK_STATUS).forEach((status) => {
  initialBoardView[status.value] = [];
});

const initialState = {
  tasks: [],
  currentTask: null,
  comments: [],
  history: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    assigneeId: '',
    projectId: '',
    dueDateRange: [null, null],
    labels: [],
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
  boardView: initialBoardView,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action) {
      state.loading = false;
      state.tasks = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || (action.payload.data && action.payload.total) || 0;
    },
    fetchTasksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchTaskStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTaskSuccess(state, action) {
      state.loading = false;
      state.currentTask = action.payload;
    },
    fetchTaskFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createTaskStart(state) {
      state.loading = true;
      state.error = null;
    },
    createTaskSuccess(state, action) {
      state.loading = false;
      state.tasks.unshift(action.payload);
    },
    createTaskFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    updateTaskStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateTaskSuccess(state, action) {
      state.loading = false;
      const index = state.tasks.findIndex((t) => t._id === action.payload._id || t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask && (state.currentTask._id === action.payload._id || state.currentTask.id === action.payload.id)) {
        state.currentTask = action.payload;
      }
    },
    updateTaskFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTaskStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteTaskSuccess(state, action) {
      state.loading = false;
      state.tasks = state.tasks.filter((t) => t._id !== action.payload && t.id !== action.payload);
    },
    deleteTaskFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    reorderTasksStart(state) {
      state.loading = true;
    },
    reorderTasksSuccess(state, action) {
      state.loading = false;
      if (action.payload) {
        state.boardView = action.payload;
      }
    },
    reorderTasksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCommentsStart(state) {
      state.loading = true;
    },
    fetchCommentsSuccess(state, action) {
      state.loading = false;
      state.comments = action.payload;
    },
    fetchCommentsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createCommentStart(state) {
      state.loading = true;
    },
    createCommentSuccess(state, action) {
      state.loading = false;
      state.comments.push(action.payload);
    },
    createCommentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCommentStart(state) {
      state.loading = true;
    },
    deleteCommentSuccess(state, action) {
      state.loading = false;
      state.comments = state.comments.filter((c) => c._id !== action.payload && c.id !== action.payload);
    },
    deleteCommentFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchHistoryStart(state) {
      state.loading = true;
    },
    fetchHistorySuccess(state, action) {
      state.loading = false;
      state.history = action.payload;
    },
    fetchHistoryFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setBoardView(state, action) {
      state.boardView = action.payload;
    },
    setTaskFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setTaskPage(state, action) {
      state.pagination.page = action.payload;
    },
    setTaskSort(state, action) {
      state.sort = action.payload;
    },
    clearCurrentTask(state) {
      state.currentTask = null;
      state.comments = [];
      state.history = [];
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  fetchTaskStart,
  fetchTaskSuccess,
  fetchTaskFailure,
  createTaskStart,
  createTaskSuccess,
  createTaskFailure,
  updateTaskStart,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskStart,
  deleteTaskSuccess,
  deleteTaskFailure,
  reorderTasksStart,
  reorderTasksSuccess,
  reorderTasksFailure,
  fetchCommentsStart,
  fetchCommentsSuccess,
  fetchCommentsFailure,
  createCommentStart,
  createCommentSuccess,
  createCommentFailure,
  deleteCommentStart,
  deleteCommentSuccess,
  deleteCommentFailure,
  fetchHistoryStart,
  fetchHistorySuccess,
  fetchHistoryFailure,
  setBoardView,
  setTaskFilters,
  setTaskPage,
  setTaskSort,
  clearCurrentTask,
  clearTaskError,
} = taskSlice.actions;

export default taskSlice.reducer;
