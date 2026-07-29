import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ icon, title, description, actionText, onAction, actionIcon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 2, fontSize: 64 }}>
        {icon || <InboxIcon sx={{ fontSize: 64 }} />}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title || 'No data found'}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mb: 3 }}>
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button variant="contained" startIcon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
