import { call, put, takeLatest } from 'redux-saga/effects';
import { taskApi } from '../../api';
import {
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
} from '../slices/taskSlice';

function* handleFetchTasks(action) {
  try {
    const response = yield call(taskApi.getTasks, action.payload);
    yield put(fetchTasksSuccess(response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch tasks';
    yield put(fetchTasksFailure(message));
  }
}

function* handleFetchTask(action) {
  try {
    const response = yield call(taskApi.getTask, action.payload);
    yield put(fetchTaskSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch task';
    yield put(fetchTaskFailure(message));
  }
}

function* handleCreateTask(action) {
  try {
    const response = yield call(taskApi.createTask, action.payload);
    yield put(createTaskSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create task';
    yield put(createTaskFailure(message));
  }
}

function* handleUpdateTask(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(taskApi.updateTask, id, data);
    yield put(updateTaskSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update task';
    yield put(updateTaskFailure(message));
  }
}

function* handleDeleteTask(action) {
  try {
    yield call(taskApi.deleteTask, action.payload);
    yield put(deleteTaskSuccess(action.payload));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete task';
    yield put(deleteTaskFailure(message));
  }
}

function* handleReorderTasks(action) {
  try {
    const { projectId, data } = action.payload;
    const response = yield call(taskApi.reorderTasks, projectId, data);
    yield put(reorderTasksSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to reorder tasks';
    yield put(reorderTasksFailure(message));
  }
}

function* handleFetchComments(action) {
  try {
    const response = yield call(taskApi.getTaskComments, action.payload);
    yield put(fetchCommentsSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch comments';
    yield put(fetchCommentsFailure(message));
  }
}

function* handleCreateComment(action) {
  try {
    const { taskId, data } = action.payload;
    const response = yield call(taskApi.createComment, taskId, data);
    yield put(createCommentSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create comment';
    yield put(createCommentFailure(message));
  }
}

function* handleDeleteComment(action) {
  try {
    const { taskId, commentId } = action.payload;
    yield call(taskApi.deleteComment, taskId, commentId);
    yield put(deleteCommentSuccess(commentId));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete comment';
    yield put(deleteCommentFailure(message));
  }
}

function* handleFetchHistory(action) {
  try {
    const response = yield call(taskApi.getTaskHistory, action.payload);
    yield put(fetchHistorySuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch history';
    yield put(fetchHistoryFailure(message));
  }
}

export default function* taskSaga() {
  yield takeLatest(fetchTasksStart.type, handleFetchTasks);
  yield takeLatest(fetchTaskStart.type, handleFetchTask);
  yield takeLatest(createTaskStart.type, handleCreateTask);
  yield takeLatest(updateTaskStart.type, handleUpdateTask);
  yield takeLatest(deleteTaskStart.type, handleDeleteTask);
  yield takeLatest(reorderTasksStart.type, handleReorderTasks);
  yield takeLatest(fetchCommentsStart.type, handleFetchComments);
  yield takeLatest(createCommentStart.type, handleCreateComment);
  yield takeLatest(deleteCommentStart.type, handleDeleteComment);
  yield takeLatest(fetchHistoryStart.type, handleFetchHistory);
}
