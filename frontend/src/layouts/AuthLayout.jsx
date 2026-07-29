import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { APP_NAME } from '../constants/config';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40vh',
          bgcolor: 'primary.main',
          opacity: 0.04,
        }}
      />
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            color="primary.main"
            sx={{ letterSpacing: '-0.5px' }}
          >
            {APP_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enterprise Project Management System
          </Typography>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Outlet />
        </Paper>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" color="text.disabled">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
