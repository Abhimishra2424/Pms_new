import { call, put, takeLatest } from 'redux-saga/effects';
import { projectApi } from '../../api';
import {
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
} from '../slices/projectSlice';

function* handleFetchProjects(action) {
  try {
    const response = yield call(projectApi.getProjects, action.payload);
    yield put(fetchProjectsSuccess(response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch projects';
    yield put(fetchProjectsFailure(message));
  }
}

function* handleFetchProject(action) {
  try {
    const response = yield call(projectApi.getProject, action.payload);
    yield put(fetchProjectSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch project';
    yield put(fetchProjectFailure(message));
  }
}

function* handleCreateProject(action) {
  try {
    const response = yield call(projectApi.createProject, action.payload);
    yield put(createProjectSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create project';
    yield put(createProjectFailure(message));
  }
}

function* handleUpdateProject(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(projectApi.updateProject, id, data);
    yield put(updateProjectSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update project';
    yield put(updateProjectFailure(message));
  }
}

function* handleDeleteProject(action) {
  try {
    yield call(projectApi.deleteProject, action.payload);
    yield put(deleteProjectSuccess(action.payload));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete project';
    yield put(deleteProjectFailure(message));
  }
}

function* handleArchiveProject(action) {
  try {
    const response = yield call(projectApi.archiveProject, action.payload);
    yield put(archiveProjectSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to archive project';
    yield put(archiveProjectFailure(message));
  }
}

function* handleFetchMembers(action) {
  try {
    const response = yield call(projectApi.getProjectMembers, action.payload);
    yield put(fetchMembersSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch members';
    yield put(fetchMembersFailure(message));
  }
}

function* handleAddMember(action) {
  try {
    const { projectId, data } = action.payload;
    const response = yield call(projectApi.addMember, projectId, data);
    yield put(addMemberSuccess(response.data.data || response.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add member';
    yield put(addMemberFailure(message));
  }
}

function* handleRemoveMember(action) {
  try {
    const { projectId, userId } = action.payload;
    yield call(projectApi.removeMember, projectId, userId);
    yield put(removeMemberSuccess(userId));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to remove member';
    yield put(removeMemberFailure(message));
  }
}

export default function* projectSaga() {
  yield takeLatest(fetchProjectsStart.type, handleFetchProjects);
  yield takeLatest(fetchProjectStart.type, handleFetchProject);
  yield takeLatest(createProjectStart.type, handleCreateProject);
  yield takeLatest(updateProjectStart.type, handleUpdateProject);
  yield takeLatest(deleteProjectStart.type, handleDeleteProject);
  yield takeLatest(archiveProjectStart.type, handleArchiveProject);
  yield takeLatest(fetchMembersStart.type, handleFetchMembers);
  yield takeLatest(addMemberStart.type, handleAddMember);
  yield takeLatest(removeMemberStart.type, handleRemoveMember);
}
