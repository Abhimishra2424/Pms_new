import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, py: 1 }}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" sx={{ flex: 1 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="70%" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function KanbanCardSkeleton({ count = 3 }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ minWidth: 280, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
          {Array.from({ length: 3 }).map((_, j) => (
            <Box key={j} sx={{ p: 1.5, mb: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function ChartSkeleton({ height = 300 }) {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

export function ProfileSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
      <Skeleton variant="circular" width={120} height={120} />
      <Skeleton variant="text" width={200} height={32} />
      <Skeleton variant="text" width={150} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mt: 2 }} />
    </Box>
  );
}

export default function SkeletonLoader({ type = 'table', ...props }) {
  switch (type) {
    case 'table':
      return <TableSkeleton {...props} />;
    case 'card':
      return <CardSkeleton {...props} />;
    case 'list':
      return <ListSkeleton {...props} />;
    case 'kanban-card':
      return <KanbanCardSkeleton {...props} />;
    case 'chart':
      return <ChartSkeleton {...props} />;
    case 'profile':
      return <ProfileSkeleton {...props} />;
    default:
      return <TableSkeleton {...props} />;
  }
}
