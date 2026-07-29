import React from 'react';
import { Chip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { PRIORITY } from '../../constants/status';

const priorityIcons = {
  lowest: null,
  low: null,
  medium: null,
  high: <ArrowUpwardIcon fontSize="inherit" />,
  highest: <ArrowUpwardIcon fontSize="inherit" />,
};

export default function PriorityBadge({ priority, size = 'small', showIcon = true, ...props }) {
  if (!priority) return null;

  const config = Object.values(PRIORITY).find((p) => p.value === priority);
  const label = config?.label || priority;
  const color = config?.color || 'default';
  const icon = showIcon ? priorityIcons[priority] : undefined;

  return (
    <Chip
      label={label}
      size={size}
      color={color}
      icon={icon}
      variant="outlined"
      {...props}
    />
  );
}
