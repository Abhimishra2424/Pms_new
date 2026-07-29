import React from 'react';
import { Chip } from '@mui/material';

export default function StatusBadge({ status, statusMap, size = 'small', ...props }) {
  if (!status || !statusMap) {
    return <Chip label={status || 'Unknown'} size={size} variant="outlined" {...props} />;
  }

  const config = Object.values(statusMap).find((s) => s.value === status);
  const label = config?.label || status;
  const color = config?.color || 'default';

  return (
    <Chip
      label={label}
      size={size}
      color={color}
      variant="outlined"
      {...props}
    />
  );
}
