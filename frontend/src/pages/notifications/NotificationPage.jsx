import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, Chip, IconButton, Tooltip,
  MenuItem, TextField, FormControl, InputLabel, Select, alpha, useTheme, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CommentIcon from '@mui/icons-material/Comment';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CircleIcon from '@mui/icons-material/Circle';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../utils/helpers';

const NOTIFICATION_TYPES = {
  task_assigned: { icon: <AssignmentIcon />, color: '#3b82f6', label: 'Task Assigned' },
  task_completed: { icon: <TaskAltIcon />, color: '#22c55e', label: 'Task Completed' },
  comment: { icon: <CommentIcon />, color: '#f97316', label: 'Comment' },
  meeting: { icon: <EventIcon />, color: '#a855f7', label: 'Meeting' },
  team: { icon: <GroupAddIcon />, color: '#06b6d4', label: 'Team' },
  warning: { icon: <WarningAmberIcon />, color: '#ef4444', label: 'Warning' },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'task_assigned', title: 'New task assigned', message: 'You have been assigned "Dashboard UI" task in Website Redesign', time: '2026-07-28T10:30:00', read: false },
  { id: 2, type: 'comment', title: 'New comment on your task', message: 'Bob Smith commented on "API Integration"', time: '2026-07-28T09:15:00', read: false },
  { id: 3, type: 'meeting', title: 'Meeting reminder', message: 'Sprint Planning starts in 15 minutes', time: '2026-07-28T08:00:00', read: false },
  { id: 4, type: 'task_completed', title: 'Task completed', message: 'Carol Davis marked "Setup CI/CD" as done', time: '2026-07-27T16:45:00', read: true },
  { id: 5, type: 'team', title: 'Team update', message: 'David Wilson has joined the Mobile App project', time: '2026-07-27T14:00:00', read: true },
  { id: 6, type: 'warning', title: 'Task overdue', message: '"Fix login bug" is overdue by 2 days', time: '2026-07-27T10:00:00', read: true },
  { id: 7, type: 'task_assigned', title: 'Review request', message: 'Please review PR #342 for the backend API', time: '2026-07-26T15:30:00', read: true },
  { id: 8, type: 'comment', title: 'Reply to your comment', message: 'Alice Johnson replied to your comment on "Design System"', time: '2026-07-26T11:20:00', read: true },
  { id: 9, type: 'meeting', title: 'Meeting cancelled', message: 'Client Meeting has been cancelled', time: '2026-07-25T09:00:00', read: true },
  { id: 10, type: 'task_completed', title: 'Milestone achieved', message: 'Sprint 10 has been completed with 95% velocity', time: '2026-07-25T08:00:00', read: true },
  { id: 11, type: 'team', title: 'New team member', message: 'Eve Martin has been added to your project', time: '2026-07-24T16:00:00', read: true },
  { id: 12, type: 'warning', title: 'Project at risk', message: 'Website Redesign is behind schedule by 1 week', time: '2026-07-24T10:00:00', read: true },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  ...Object.entries(NOTIFICATION_TYPES).map(([key, val]) => ({ value: key, label: val.label })),
];

export default function NotificationPage() {
  const theme = useTheme();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return MOCK_NOTIFICATIONS;
    if (filter === 'unread') return MOCK_NOTIFICATIONS.filter((n) => !n.read);
    return MOCK_NOTIFICATIONS.filter((n) => n.type === filter);
  }, [filter]);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title="Notifications"
        subtitle="All your notifications"
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0 && (
            <Button variant="outlined" startIcon={<MarkEmailReadIcon />} onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField select value={filter} onChange={(e) => setFilter(e.target.value)} size="small" sx={{ minWidth: 160 }}>
          {FILTER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <Chip label={`${unreadCount} unread`} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'center' }} />
      </Stack>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<NotificationsIcon sx={{ fontSize: 64 }} />}
          title="No notifications"
          description={filter !== 'all' ? 'No notifications for this filter' : 'You are all caught up!'}
        />
      ) : (
        <Stack spacing={1}>
          {filtered.map((notification) => {
            const nt = NOTIFICATION_TYPES[notification.type] || { icon: <NotificationsIcon />, color: '#64748b' };
            return (
              <motion.div key={notification.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'background.paper' : alpha(theme.palette.primary.main, 0.04),
                    '&:hover': { boxShadow: 2 },
                    borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', bgcolor: alpha(nt.color, 0.1), color: nt.color, flexShrink: 0,
                        fontSize: 20,
                      }}>
                        {nt.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          {!notification.read && <CircleIcon sx={{ fontSize: 8, color: theme.palette.primary.main }} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                          {formatRelativeTime(notification.time)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Stack>
      )}
    </motion.div>
  );
}
