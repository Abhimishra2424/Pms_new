import { call, put, takeLatest } from 'redux-saga/effects';
import { authApi } from '../../api';
import { STORAGE_KEYS } from '../../constants/config';
import {
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
} from '../slices/authSlice';

function* handleLogin(action) {
  try {
    const response = yield call(authApi.login, action.payload);
    const { user, token, refreshToken, permissions } = response.data.data || response.data;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    yield put(loginSuccess({ user, token, refreshToken, permissions }));
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || 'Login failed';
    yield put(loginFailure(message));
  }
}

function* handleRegister(action) {
  try {
    yield call(authApi.register, action.payload);
    yield put(registerSuccess());
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
    yield put(registerFailure(message));
  }
}

function* handleLogout() {
  try {
    yield call(authApi.logout);
  } catch {
    // ignore logout API errors
  } finally {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    yield put(logoutSuccess());
  }
}

function* handleGetProfile() {
  try {
    const response = yield call(authApi.getProfile);
    const user = response.data.data || response.data;
    yield put(getProfileSuccess(user));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch profile';
    yield put(getProfileFailure(message));
  }
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, handleLogin);
  yield takeLatest(registerStart.type, handleRegister);
  yield takeLatest(logoutStart.type, handleLogout);
  yield takeLatest(getProfileStart.type, handleGetProfile);
}
