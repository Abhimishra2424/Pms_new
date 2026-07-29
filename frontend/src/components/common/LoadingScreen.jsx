import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { APP_NAME } from '../../constants/config';

export default function LoadingScreen({ message }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        gap: 3,
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Typography variant="h6" color="text.secondary" fontWeight={600}>
        {APP_NAME}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
