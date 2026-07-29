import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Avatar, Checkbox, IconButton,
  Button, Select, MenuItem, FormControl, alpha, useTheme,
  Tooltip, Badge, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageHeader from '../../components/common/PageHeader';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { ListSkeleton } from '../../components/common/SkeletonLoader';
import TaskFormDialog from './TaskFormDialog';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

dayjs.extend(isoWeek);

const sectionConfig = {
  overdue: { label: 'Overdue', color: 'error', icon: CircleIcon },
  due_today: { label: 'Due Today', color: 'warning', icon: ScheduleIcon },
  upcoming: { label: 'Upcoming (This Week)', color: 'primary', icon: ScheduleIcon },
  no_due: { label: 'No Due Date', color: 'default', icon: CircleIcon },
};

export default function MyTasksPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { getTasks } = await import('../../api/taskApi');
      const { data } = await getTasks({ assigneeId: 'me', limit: 200 });
      setTasks(data?.data || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const sections = useMemo(() => {
    const result = { overdue: [], due_today: [], upcoming: [], no_due: [] };
    const today = dayjs().startOf('day');
    const weekEnd = dayjs().endOf('isoWeek');

    tasks.forEach((task) => {
      const due = task.dueDate ? dayjs(task.dueDate) : null;
      const isDone = task.status === 'done' || completedIds.includes(task._id || task.id);

      if (isDone && !completedIds.includes(task._id || task.id)) return;

      if (completedIds.includes(task._id || task.id)) {
        result.due_today.push(task);
        return;
      }

      if (!due) {
        result.no_due.push(task);
      } else if (due.isBefore(today, 'day') && !isDone) {
        result.overdue.push(task);
      } else if (due.isSame(today, 'day')) {
        result.due_today.push(task);
      } else if (due.isBefore(weekEnd) && due.isAfter(today, 'day')) {
        result.upcoming.push(task);
      } else {
        result.no_due.push(task);
      }
    });

    Object.keys(result).forEach((key) => {
      result[key].sort((a, b) => {
        const pOrder = { highest: 0, high: 1, medium: 2, low: 3, lowest: 4 };
        return (pOrder[a.priority] ?? 5) - (pOrder[b.priority] ?? 5);
      });
    });

    return result;
  }, [tasks, completedIds]);

  const handleQuickComplete = async (taskId) => {
    const wasCompleted = completedIds.includes(taskId);
    if (wasCompleted) {
      setCompletedIds((prev) => prev.filter((id) => id !== taskId));
      try {
        const { updateTask } = await import('../../api/taskApi');
        await updateTask(taskId, { status: 'todo' });
      } catch {}
    } else {
      setCompletedIds((prev) => [...prev, taskId]);
      try {
        const { updateTask } = await import('../../api/taskApi');
        await updateTask(taskId, { status: 'done' });
        toast.success('Task completed');
      } catch {
        setCompletedIds((prev) => prev.filter((id) => id !== taskId));
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t._id || t.id) === taskId ? { ...t, status: newStatus } : t));
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${TASK_STATUS[newStatus.toUpperCase()]?.label || newStatus}`);
    } catch {
      fetchTasks();
      toast.error('Failed to update status');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    const newSections = { ...sections };
    const [movedTask] = newSections[sourceKey].splice(source.index, 1);
    newSections[destKey].splice(destination.index, 0, movedTask);

    let newStatus = 'todo';
    if (destKey === 'overdue' || destKey === 'due_today') newStatus = 'in_progress';
    else if (destKey === 'upcoming') newStatus = 'todo';
    else if (destKey === 'no_due') newStatus = 'backlog';

    const taskId = movedTask._id || movedTask.id;
    setTasks((prev) => prev.map((t) => (t._id || t.id) === taskId ? { ...t, status: newStatus } : t));
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(taskId, { status: newStatus });
    } catch {
      fetchTasks();
    }
  };

  const handleSetDueDate = async (taskId, date) => {
    setTasks((prev) => prev.map((t) => (t._id || t.id) === taskId ? { ...t, dueDate: date } : t));
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(taskId, { dueDate: date });
      toast.success('Due date updated');
    } catch {
      fetchTasks();
    }
  };

  const getTaskCount = (section) => {
    const count = sections[section].length;
    const config = sectionConfig[section];
    if (!config) return null;
    return (
      <Chip
        label={`${count} ${count === 1 ? 'task' : 'tasks'}`}
        size="small"
        variant="outlined"
        color={config.color === 'default' ? 'default' : config.color}
        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
      />
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const statusActions = (task) => (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={task.status}
        onChange={(e) => handleStatusChange(task._id || task.id, e.target.value)}
        sx={{
          fontSize: '0.75rem', height: 28,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.3) },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {Object.values(TASK_STATUS).map((s) => (
          <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.75rem' }}>{s.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderTaskCard = (task, index, sectionKey) => {
    const isCompleting = completedIds.includes(task._id || task.id);
    const name = task.assignee?.name || `${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`.trim() || '';

    return (
      <Draggable key={task._id || task.id} draggableId={task._id || task.id} index={index}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{
              p: 1.5, mb: 1, borderRadius: 2,
              bgcolor: isCompleting ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
              border: '1px solid',
              borderColor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.divider, 0.08),
              opacity: isCompleting ? 0.6 : 1,
              transition: 'all 0.2s',
              '&:hover': { borderColor: alpha(theme.palette.divider, 0.25), boxShadow: 1 },
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/tasks/${task._id || task.id}`)}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box
                {...provided.dragHandleProps}
                sx={{ mt: 0.3, color: 'text.disabled', cursor: 'grab', display: 'flex', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
              <Checkbox
                checked={isCompleting}
                onChange={(e) => { e.stopPropagation(); handleQuickComplete(task._id || task.id); }}
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20, color: alpha(theme.palette.text.secondary, 0.3) }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />}
                sx={{ p: 0.3, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    textDecoration: isCompleting ? 'line-through' : 'none',
                    color: isCompleting ? 'text.disabled' : 'text.primary',
                    mb: 0.5,
                  }}
                >
                  {task.title}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
                  {task.project?.name && (
                    <Chip
                      label={task.project.name}
                      size="small"
                      variant="filled"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.6rem', fontWeight: 500 }}
                    />
                  )}
                  <PriorityBadge priority={task.priority} size="small" />
                  <StatusBadge status={task.status} statusMap={TASK_STATUS} size="small" />
                  {task.labels?.slice(0, 2).map((l) => (
                    <Chip key={l} label={l} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                  ))}
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {name ? (
                      <Avatar src={task.assignee?.avatar} sx={{ width: 22, height: 22, fontSize: 9, bgcolor: generateAvatarColor(name) }}>
                        {getInitials(name)}
                      </Avatar>
                    ) : (
                      <IconButton size="small" sx={{ width: 22, height: 22 }} onClick={(e) => { e.stopPropagation(); }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    {task.dueDate && (
                      <Typography
                        variant="caption"
                        color={dayjs(task.dueDate).isBefore(dayjs(), 'day') && !isCompleting ? 'error' : 'text.secondary'}
                        fontWeight={dayjs(task.dueDate).isBefore(dayjs(), 'day') && !isCompleting ? 600 : 400}
                      >
                        {formatDate(task.dueDate, 'MMM DD')}
                      </Typography>
                    )}
                  </Stack>
                  {statusActions(task)}
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Draggable>
    );
  };

  if (loading && !tasks.length) {
    return (
      <Box>
        <PageHeader title="My Tasks" subtitle="Tasks assigned to you" breadcrumbs={[{ label: 'My Tasks' }]} />
        <ListSkeleton rows={8} />
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="My Tasks"
        subtitle="Tasks assigned to you"
        breadcrumbs={[{ label: 'My Tasks' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            New Task
          </Button>
        }
      />

      {tasks.length === 0 && !loading ? (
        <EmptyState
          title="No tasks assigned"
          description="Tasks assigned to you will appear here. Create a new task or ask your team to assign you one."
          actionText="Create Task"
          actionIcon={<AddIcon />}
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.entries(sectionConfig).map(([key, config]) => {
              const tasksInSection = sections[key];
              const Icon = config.icon;
              const isOverdue = key === 'overdue';

              return (
                <motion.div key={key} variants={itemVariants}>
                  <Box sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Icon
                        sx={{
                          fontSize: 18,
                          color: isOverdue ? 'error.main' : config.color === 'default' ? 'text.secondary' : `${config.color}.main`,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color={isOverdue ? 'error' : config.color === 'default' ? 'text.secondary' : `${config.color}`}
                      >
                        {config.label}
                      </Typography>
                      {getTaskCount(key)}
                    </Stack>
                    <Droppable droppableId={key}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            minHeight: tasksInSection.length === 0 ? 60 : undefined,
                            borderRadius: 2,
                            bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                            p: tasksInSection.length > 0 ? 0 : 1,
                            transition: 'background-color 0.2s',
                          }}
                        >
                          {tasksInSection.length === 0 ? (
                            <Box sx={{ py: 2, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.disabled">
                                {key === 'overdue' ? 'Nothing overdue! 🎉' : 'No tasks'}
                              </Typography>
                            </Box>
                          ) : (
                            tasksInSection.map((task, index) => renderTaskCard(task, index, key))
                          )}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </DragDropContext>
      )}

      {formOpen && (
        <TaskFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={fetchTasks}
        />
      )}
    </motion.div>
  );
}