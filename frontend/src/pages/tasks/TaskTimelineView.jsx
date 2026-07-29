import React, { useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Stack, Chip, IconButton, Button, Tooltip,
  alpha, useTheme, Avatar, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import DiamondIcon from '@mui/icons-material/Diamond';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, getInitials, generateAvatarColor } from '../../utils/helpers';

const ZOOM_LEVELS = {
  day: { label: 'Day', days: 1, columnWidth: 60 },
  week: { label: 'Week', days: 7, columnWidth: 120 },
  month: { label: 'Month', days: 30, columnWidth: 80 },
};

export default function TaskTimelineView({ tasks, loading, onRefresh }) {
  const theme = useTheme();
  const [zoom, setZoom] = useState('week');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().startOf('isoWeek'));
  const scrollRef = useRef(null);

  const zoomConfig = ZOOM_LEVELS[zoom];

  const groupedTasks = useMemo(() => {
    const groups = {};
    Object.values(TASK_STATUS).forEach((s) => { groups[s.value] = []; });
    tasks.forEach((task) => {
      const status = task.status || 'backlog';
      if (groups[status]) groups[status].push(task);
      else groups.backlog.push(task);
    });
    return groups;
  }, [tasks]);

  const timelineColumns = useMemo(() => {
    const columns = [];
    const totalDays = zoom === 'month' ? 30 : zoom === 'week' ? 7 : 14;
    for (let i = 0; i < totalDays; i++) {
      columns.push(startDate.add(i, 'day'));
    }
    return columns;
  }, [startDate, zoom]);

  const navigateTimeline = (direction) => {
    const days = zoom === 'month' ? 30 : zoom === 'week' ? 7 : 7;
    setStartDate((prev) => prev.add(direction * days, 'day'));
  };

  const goToToday = () => setStartDate(dayjs().startOf('isoWeek'));

  const getTaskBarStyle = (task) => {
    const start = task.startDate ? dayjs(task.startDate) : null;
    const due = task.dueDate ? dayjs(task.dueDate) : null;

    if (!due && !start) return null;

    const effectiveStart = start || due;
    const effectiveEnd = due || (start ? start.add(3, 'day') : null);

    if (!effectiveStart || !effectiveEnd) return null;

    const totalDays = timelineColumns.length;
    const firstDay = timelineColumns[0];
    const lastDay = timelineColumns[timelineColumns.length - 1];

    const barStart = effectiveStart.isBefore(firstDay) ? 0 : effectiveStart.diff(firstDay, 'day');
    const barEnd = effectiveEnd.isAfter(lastDay) ? totalDays : effectiveEnd.diff(firstDay, 'day');

    const left = (barStart / totalDays) * 100;
    const width = ((barEnd - barStart) / totalDays) * 100;

    const statusConfig = Object.values(TASK_STATUS).find((s) => s.value === task.status);
    const priorityConfig = Object.values(PRIORITY).find((p) => p.value === task.priority);

    const color = statusConfig?.color || 'primary';
    const isDone = task.status === 'done';
    const isOverdue = due && dayjs(due).isBefore(dayjs(), 'day') && !isDone;

    return {
      left: `${Math.max(left, 0)}%`,
      width: `${Math.max(width, 2)}%`,
      bgcolor: isOverdue ? theme.palette.error.main :
        isDone ? theme.palette.success.main :
        theme.palette[color]?.main || theme.palette.primary.main,
      opacity: isDone ? 0.5 : 0.85,
    };
  };

  const isToday = (date) => date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

  const handleBarDrag = async (taskId, newStartDate, newEndDate) => {
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(taskId, {
        startDate: newStartDate?.toISOString(),
        dueDate: newEndDate?.toISOString(),
      });
      toast.success('Timeline updated');
      onRefresh?.();
    } catch {
      toast.error('Failed to update timeline');
    }
  };

  const statusColor = (status) => {
    const config = Object.values(TASK_STATUS).find((s) => s.value === status);
    return config?.color || 'default';
  };

  if (loading && !tasks.length) {
    return <CardSkeleton count={2} />;
  }

  const totalDays = timelineColumns.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box>
        {/* Controls */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => navigateTimeline(-1)}><ChevronLeftIcon /></IconButton>
            <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: 160, textAlign: 'center' }}>
              {timelineColumns[0]?.format('MMM D, YYYY')} - {timelineColumns[timelineColumns.length - 1]?.format('MMM D, YYYY')}
            </Typography>
            <IconButton size="small" onClick={() => navigateTimeline(1)}><ChevronRightIcon /></IconButton>
            <Button size="small" variant="outlined" startIcon={<TodayIcon />} onClick={goToToday}>
              Today
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={() => {
              const levels = Object.keys(ZOOM_LEVELS);
              const idx = levels.indexOf(zoom);
              setZoom(levels[Math.max(0, idx - 1)]);
            }}><ZoomOutIcon /></IconButton>
            <ToggleButtonGroup value={zoom} exclusive onChange={(_, v) => v && setZoom(v)} size="small">
              {Object.entries(ZOOM_LEVELS).map(([key, config]) => (
                <ToggleButton key={key} value={key}>{config.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
            <IconButton size="small" onClick={() => {
              const levels = Object.keys(ZOOM_LEVELS);
              const idx = levels.indexOf(zoom);
              setZoom(levels[Math.min(levels.length - 1, idx + 1)]);
            }}><ZoomInIcon /></IconButton>
          </Stack>
        </Stack>

        {/* Timeline */}
        <Box sx={{ display: 'flex', borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          {/* Left panel - Task list */}
          <Box sx={{ minWidth: 280, maxWidth: 280, borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: 'auto' }}>
            {Object.entries(groupedTasks).map(([status, statusTasks]) => {
              if (statusTasks.length === 0) return null;
              const sConfig = Object.values(TASK_STATUS).find((s) => s.value === status);
              return (
                <Box key={status}>
                  <Box sx={{ px: 1.5, py: 0.75, bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${sConfig?.color || 'grey'}.main` }} />
                      <Typography variant="caption" fontWeight={600}>
                        {sConfig?.label || status}
                      </Typography>
                      <Chip label={statusTasks.length} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                    </Stack>
                  </Box>
                  {statusTasks.map((task) => {
                    const assignee = task.assignee || task.assigneeId;
                    const assigneeName = assignee?.name || `${assignee?.firstName || ''} ${assignee?.lastName || ''}`.trim() || '';
                    return (
                      <Box
                        key={task._id || task.id}
                        sx={{
                          px: 1.5, py: 1.25, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                          minHeight: 44,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {task.title}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                              <PriorityBadge priority={task.priority} size="small" />
                              {assigneeName && (
                                <Avatar src={assignee?.avatar} sx={{ width: 18, height: 18, fontSize: 7 }}>
                                  {getInitials(assigneeName)}
                                </Avatar>
                              )}
                            </Stack>
                          </Box>
                          {task.isMilestone && (
                            <DiamondIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>

          {/* Right panel - Timeline grid */}
          <Box sx={{ flex: 1, overflow: 'auto' }} ref={scrollRef}>
            {/* Header */}
            <Box sx={{ display: 'flex', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 2 }}>
              {timelineColumns.map((date, i) => {
                const isWeekStart = date.day() === 0 || i === 0;
                return (
                  <Box
                    key={i}
                    sx={{
                      flex: `0 0 ${zoomConfig.columnWidth}px`,
                      py: 0.75,
                      textAlign: 'center',
                      borderLeft: i > 0 ? `1px solid ${alpha(theme.palette.divider, 0.06)}` : 'none',
                      bgcolor: isToday(date) ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                      borderBottom: isToday(date) ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                  >
                    <Typography variant="caption" fontWeight={isWeekStart ? 600 : 400} color={isToday(date) ? 'primary' : 'text.secondary'}>
                      {zoom === 'day' ? date.format('ddd D') : zoom === 'week' ? date.format('ddd D') : date.format('D')}
                    </Typography>
                    {isWeekStart && (
                      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                        {date.format('MMM')}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Rows */}
            {Object.entries(groupedTasks).map(([status, statusTasks]) => {
              if (statusTasks.length === 0) return null;
              return (
                <Box key={status}>
                  {/* Spacer for group header */}
                  <Box sx={{ height: 36 }} />
                  {statusTasks.map((task) => {
                    const barStyle = getTaskBarStyle(task);
                    const isMilestone = task.isMilestone || (task.type === 'milestone');
                    const due = task.dueDate ? dayjs(task.dueDate) : null;

                    return (
                      <Box
                        key={task._id || task.id}
                        sx={{
                          position: 'relative',
                          height: 44,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                        }}
                      >
                        {/* Today line */}
                        {timelineColumns.some((d) => isToday(d)) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0, bottom: 0,
                              left: `${(timelineColumns.findIndex((d) => isToday(d)) / totalDays) * 100}%`,
                              width: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.4),
                              zIndex: 1,
                            }}
                          />
                        )}

                        {/* Task Bar */}
                        {barStyle && (
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                                <Typography variant="caption">
                                  {task.startDate ? formatDate(task.startDate) : '?'} → {task.dueDate ? formatDate(task.dueDate) : '?'}
                                </Typography>
                              </Box>
                            }
                            arrow
                          >
                            <Box
                              draggable
                              onDragEnd={(e) => {
                                const rect = e.target.closest('[data-timeline-row]')?.getBoundingClientRect();
                                if (rect) {
                                  const x = e.clientX - rect.left;
                                  const pct = x / rect.width;
                                  const dayOffset = Math.round(pct * totalDays);
                                  const newStart = timelineColumns[Math.max(0, dayOffset - 1)] || null;
                                  const newEnd = timelineColumns[Math.min(totalDays - 1, dayOffset + 1)] || null;
                                  handleBarDrag(task._id || task.id, newStart, newEnd);
                                }
                              }}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: 24,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                cursor: 'grab',
                                zIndex: 2,
                                overflow: 'hidden',
                                ...barStyle,
                                '&:hover': { opacity: 1, boxShadow: 1 },
                              }}
                            >
                              {isMilestone ? (
                                <DiamondIcon sx={{ fontSize: 14, color: '#fff' }} />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="#fff"
                                  fontWeight={600}
                                  noWrap
                                  sx={{ fontSize: '0.65rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                                >
                                  {task.title}
                                </Typography>
                              )}
                            </Box>
                          </Tooltip>
                        )}

                        {/* Dependency arrow area */}
                        {task.dependencies?.length > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 2,
                              bgcolor: alpha(theme.palette.warning.main, 0.3),
                            }}
                          />
                        )}

                        {/* Data attribute for drag calculations */}
                        <Box data-timeline-row sx={{ position: 'absolute', inset: 0 }} />
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}