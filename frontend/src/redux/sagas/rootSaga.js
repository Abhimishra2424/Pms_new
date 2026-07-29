import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import projectSaga from './projectSaga';
import taskSaga from './taskSaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(projectSaga),
    fork(taskSaga),
  ]);
}
