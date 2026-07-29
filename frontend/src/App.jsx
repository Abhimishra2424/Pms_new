import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';
import { getProfileStart } from './redux/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfileStart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <BrowserRouter>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
      <ToastContainer position="bottom-right" theme="colored" newestOnTop />
    </BrowserRouter>
  );
}

export default App;
