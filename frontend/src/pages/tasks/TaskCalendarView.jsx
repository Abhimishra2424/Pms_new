import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Stack, Chip, IconButton, Button, Tooltip,
  alpha, useTheme, Paper, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText,
  ListItemAvatar,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CircleIcon from '@mui/icons-material/Circle';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, getInitials, generateAvatarColor } from '../../utils/helpers';

export default function TaskCalendarView({ tasks, loading, onRefresh }) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  const endOfCalendar = endOfMonth.endOf('week');

  const weeks = useMemo(() => {
    const result = [];
    let day = startOfCalendar;
    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = day.add(1, 'day');
      }
      result.push(week);
    }
    return result;
  }, [startOfCalendar, endOfCalendar]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = dayjs(task.dueDate).format('YYYY-MM-DD');
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const getTasksForDay = useCallback((date) => {
    const key = date.format('YYYY-MM-DD');
    return tasksByDate[key] || [];
  }, [tasksByDate]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setDayTasks(getTasksForDay(date));
    setDayDialogOpen(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newDateStr = result.destination.droppableId;
    const newDate = dayjs(newDateStr);

    setDayTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));

    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(taskId, { dueDate: newDate.toISOString() });
      toast.success('Due date updated');
      onRefresh?.();
    } catch {
      toast.error('Failed to update due date');
    }
  };

  const navigateMonth = (delta) => setCurrentDate((prev) => prev.add(delta, 'month'));
  const goToToday = () => setCurrentDate(dayjs());

  const priorityColor = (priority) => {
    const config = Object.values(PRIORITY).find((p) => p.value === priority);
    return config?.color || 'default';
  };

  const statusColor = (status) => {
    const config = Object.values(TASK_STATUS).find((s) => s.value === status);
    return config?.color || 'default';
  };

  if (loading && !tasks.length) {
    return <CardSkeleton count={3} />;
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = dayjs().format('YYYY-MM-DD');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        {/* Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => navigateMonth(-1)}><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" fontWeight={600} sx={{ minWidth: 180, textAlign: 'center' }}>
              {currentDate.format('MMMM YYYY')}
            </Typography>
            <IconButton size="small" onClick={() => navigateMonth(1)}><ChevronRightIcon /></IconButton>
          </Stack>
          <Button size="small" variant="outlined" startIcon={<TodayIcon />} onClick={goToToday}>
            Today
          </Button>
        </Stack>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
          {Object.values(PRIORITY).map((p) => (
            <Stack key={p.value} direction="row" spacing={0.5} alignItems="center">
              <CircleIcon sx={{ fontSize: 10, color: `${p.color}.main` }} />
              <Typography variant="caption" color="text.secondary">{p.label}</Typography>
            </Stack>
          ))}
          <Box sx={{ width: 1, height: 16, bgcolor: 'divider', mx: 0.5 }} />
          {Object.values(TASK_STATUS).map((s) => (
            <Stack key={s.value} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${s.color}.main` }} />
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Stack>
          ))}
        </Stack>

        {/* Calendar Grid */}
        <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
          {/* Weekday headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDays.map((day) => (
              <Box key={day} sx={{ py: 1, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">{day}</Typography>
              </Box>
            ))}
          </Box>

          <DragDropContext onDragEnd={handleDragEnd}>
            {weeks.map((week, wi) => (
              <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.map((date) => {
                  const dateStr = date.format('YYYY-MM-DD');
                  const isCurrentMonth = date.month() === currentDate.month();
                  const isToday = dateStr === today;
                  const dayTasksList = getTasksForDay(date);
                  const isOverflow = dayTasksList.length > 3;

                  return (
                    <Droppable key={dateStr} droppableId={dateStr}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            minHeight: 110,
                            borderRight: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                            bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.05) :
                              isToday ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                            opacity: isCurrentMonth ? 1 : 0.4,
                            p: 0.5,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                          }}
                          onClick={() => handleDayClick(date)}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={isToday ? 700 : 500}
                            color={isToday ? 'primary' : isCurrentMonth ? 'text.primary' : 'text.disabled'}
                            sx={{
                              display: 'inline-block',
                              width: 24, height: 24, lineHeight: '24px',
                              textAlign: 'center',
                              borderRadius: '50%',
                              bgcolor: isToday ? 'primary.main' : 'transparent',
                              color: isToday ? '#fff' : undefined,
                              mb: 0.5,
                            }}
                          >
                            {date.format('D')}
                          </Typography>
                          {dayTasksList.slice(0, 3).map((task) => {
                            const pColor = priorityColor(task.priority);
                            return (
                              <Draggable key={task._id || task.id} draggableId={task._id || task.id} index={0}>
                                {(provided) => (
                                  <Tooltip title={task.title} arrow>
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.3, px: 0.5, py: 0.15, borderRadius: 0.5,
                                        bgcolor: alpha(theme.palette[`${pColor}`]?.main || theme.palette.text.disabled, 0.1),
                                        overflow: 'hidden',
                                        '&:hover': { bgcolor: alpha(theme.palette[`${pColor}`]?.main || theme.palette.text.disabled, 0.2) },
                                      }}
                                    >
                                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, bgcolor: `${pColor}.main` }} />
                                      <Typography variant="caption" noWrap sx={{ fontSize: '0.6rem', lineHeight: 1.3 }}>
                                        {task.title}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                )}
                              </Draggable>
                            );
                          })}
                          {isOverflow && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', pl: 0.5 }}>
                              +{dayTasksList.length - 3} more
                            </Typography>
                          )}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  );
                })}
              </Box>
            ))}
          </DragDropContext>
        </Paper>

        {/* Day Detail Dialog */}
        <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={600}>
                {selectedDate?.format('dddd, MMMM D, YYYY')}
              </Typography>
              <Chip label={`${dayTasks.length} tasks`} size="small" variant="outlined" />
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {dayTasks.length === 0 ? (
              <EmptyState title="No tasks due" description="No tasks are due on this day." />
            ) : (
              <List disablePadding>
                {dayTasks.map((task) => {
                  const assignee = task.assignee || task.assigneeId;
                  const assigneeName = assignee?.name || `${assignee?.firstName || ''} ${assignee?.lastName || ''}`.trim() || '';
                  return (
                    <ListItem key={task._id || task.id} divider sx={{ px: 0 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${statusColor(task.status)}.main`, mt: 1 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500}>{task.title}</Typography>}
                        secondary={
                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ mt: 0.3 }}>
                            <PriorityBadge priority={task.priority} size="small" />
                            <StatusBadge status={task.status} statusMap={TASK_STATUS} size="small" />
                            {task.project?.name && (
                              <Chip label={task.project.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                            )}
                            {assigneeName && (
                              <Avatar src={assignee?.avatar} sx={{ width: 20, height: 20, fontSize: 8 }}>
                                {getInitials(assigneeName)}
                              </Avatar>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDayDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}