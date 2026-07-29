import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import companyReducer from './slices/companySlice';
import departmentReducer from './slices/departmentSlice';
import designationReducer from './slices/designationSlice';
import employeeReducer from './slices/employeeSlice';
import chatReducer from './slices/chatSlice';

import rootSaga from './sagas/rootSaga';

const createNoopStorage = () => ({
  getItem() { return Promise.resolve(null); },
  setItem(_key, value) { return Promise.resolve(value); },
  removeItem() { return Promise.resolve(); },
});

const storage = typeof window !== 'undefined'
  ? {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    }
  : createNoopStorage();

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated', 'permissions'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  project: projectReducer,
  task: taskReducer,
  ui: uiReducer,
  notification: notificationReducer,
  company: companyReducer,
  department: departmentReducer,
  designation: designationReducer,
  employee: employeeReducer,
  chat: chatReducer,
});

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
