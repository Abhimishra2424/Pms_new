import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logoutStart, logoutSuccess, logoutFailure } from '../../redux/slices/authSlice';
import * as authApi from '../../api/authApi';

export default function LogoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      dispatch(logoutStart());
      try {
        await authApi.logout();
      } catch {
      } finally {
        dispatch(logoutSuccess());
        navigate('/login', { replace: true });
      }
    };
    performLogout();
  }, [dispatch, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={32} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Logging out...
        </Typography>
      </Box>
    </motion.div>
  );
}
