import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', p: 4 }}>
      <Typography variant="h1" fontWeight={800} color="primary.main" sx={{ fontSize: '6rem' }}>404</Typography>
      <Typography variant="h5" gutterBottom>Page not found</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
    </Box>
  );
}
