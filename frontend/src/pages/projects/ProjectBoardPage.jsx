import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Avatar, IconButton, TextField, MenuItem,
  Button, Badge, Tooltip, Paper, Card as MuiCard, CardContent, InputAdornment,
  Select, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import { KanbanCardSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { getTasks, updateTask, reorderTasks, createTask } from '../../api/taskApi';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, getInitials, generateAvatarColor } from '../../utils/helpers';

const COLUMNS = [
  { ...TASK_STATUS.BACKLOG },
  { ...TASK_STATUS.TODO },
  { ...TASK_STATUS.IN_PROGRESS },
  { ...TASK_STATUS.IN_REVIEW },
  { ...TASK_STATUS.DONE },
];

const STATUS_ORDER = COLUMNS.map((c) => c.value);

function BoardColumn({ column, tasks, onQuickCreate }) {
  const columnTasks = tasks || [];

  return (
    <Box
      sx={{
        minWidth: 300, maxWidth: 340, flex: 1,
        display: 'flex', flexDirection: 'column',
        bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden',
      }}
    >
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
            {column.label}
          </Typography>
          <Chip label={columnTasks.length} size="small"
            sx={{ height: 20, minWidth: 20, fontSize: '0.7rem', fontWeight: 600 }} />
        </Stack>
        <Tooltip title="Quick create task">
          <IconButton size="small" onClick={() => onQuickCreate(column.value)}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Droppable droppableId={column.value} type="TASK">
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1, overflowY: 'auto', minHeight: 200,
              p: 1, display: 'flex', flexDirection: 'column', gap: 1,
              bgcolor: snapshot.isDraggingOver ? 'primary.light' : 'transparent',
              transition: 'background-color 0.2s ease',
              opacity: snapshot.isDraggingOver ? 0.95 : 1,
            }}
          >
            {columnTasks.length === 0 && !snapshot.isDraggingOver ? (
              <EmptyState
                title="No tasks"
                description="Drag tasks here or create one"
                icon={<Box sx={{ fontSize: 32 }}><AddIcon fontSize="inherit" /></Box>}
              />
            ) : (
              columnTasks.map((task, index) => (
                <Draggable key={task._id || task.id} draggableId={String(task._id || task.id)} index={index}>
                  {(provided, snapshot) => (
                    <TaskCard
                      task={task}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}

function TaskCard({ task, provided, isDragging }) {
  const assignee = task.assignee;
  const assigneeName = assignee?.name || `${assignee?.firstName || ''} ${assignee?.lastName || ''}`.trim() || '';
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'done';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      <MuiCard
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        sx={{
          cursor: 'grab', userSelect: 'none',
          boxShadow: isDragging ? 8 : 1,
          transform: isDragging ? 'rotate(3deg)' : 'none',
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': { boxShadow: 3 },
          borderLeft: '4px solid',
          borderLeftColor: task.priority === 'highest' || task.priority === 'high' ? 'error.main'
            : task.priority === 'medium' ? 'warning.main' : 'primary.main',
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" fontWeight={600} sx={{
                lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {task.title}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              <PriorityBadge priority={task.priority} size="small" showIcon={false} sx={{ height: 20, fontSize: '0.65rem' }} />
              {task.storyPoints && (
                <Chip label={`${task.storyPoints}pt`} size="small"
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
              )}
              {task.labels?.slice(0, 2).map((label) => (
                <Chip key={label} label={label} size="small" variant="outlined"
                  sx={{ height: 20, fontSize: '0.6rem' }} />
              ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                {task.taskId || task._id?.slice(-6) || ''}
              </Typography>
              {task.dueDate && (
                <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}
                  sx={{ fontSize: '0.65rem', fontWeight: isOverdue ? 600 : 400 }}>
                  {formatDate(task.dueDate, 'DD MMM')}
                </Typography>
              )}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box />
              {assignee && (
                <Tooltip title={assigneeName}>
                  <Avatar
                    src={assignee.avatar}
                    sx={{ width: 24, height: 24, fontSize: 10, bgcolor: generateAvatarColor(assigneeName) }}
                  >
                    {getInitials(assigneeName)}
                  </Avatar>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </MuiCard>
    </motion.div>
  );
}

export default function ProjectBoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState({});
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [quickCreateColumn, setQuickCreateColumn] = useState(null);
  const [quickCreateTitle, setQuickCreateTitle] = useState('');
  const [allAssignees, setAllAssignees] = useState([]);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getTasks({ projectId: id, limit: 200 });
      const tasks = data?.data || data || [];
      const board = {};
      COLUMNS.forEach((col) => { board[col.value] = []; });
      tasks.forEach((task) => {
        const status = task.status || 'backlog';
        if (board[status]) board[status].push(task);
      });
      setColumns(board);

      const assignees = tasks
        .map((t) => t.assignee)
        .filter(Boolean)
        .filter((a, i, arr) => arr.findIndex((x) => (x._id || x.id) === (a._id || a.id)) === i);
      setAllAssignees(assignees);
    } catch (err) {
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const newColumns = { ...columns };
    const sourceItems = [...newColumns[sourceCol]];
    const [movedItem] = sourceItems.splice(source.index, 1);
    newColumns[sourceCol] = sourceItems;

    if (sourceCol === destCol) {
      const destItems = [...newColumns[destCol]];
      destItems.splice(destination.index, 0, movedItem);
      newColumns[destCol] = destItems;
    } else {
      const destItems = [...(newColumns[destCol] || [])];
      destItems.splice(destination.index, 0, { ...movedItem, status: destCol });
      newColumns[destCol] = destItems;
    }
    setColumns(newColumns);

    try {
      if (sourceCol !== destCol) {
        await updateTask(draggableId, { status: destCol });
      }
      await reorderTasks(id, {
        boardView: newColumns,
        sourceColumn: sourceCol,
        destColumn: destCol,
        sourceIndex: source.index,
        destIndex: destination.index,
        taskId: draggableId,
      });
    } catch (err) {
      toast.error('Failed to update task position');
      fetchBoard();
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateTitle.trim() || !quickCreateColumn) return;
    try {
      await createTask({
        title: quickCreateTitle,
        status: quickCreateColumn,
        projectId: id,
      });
      toast.success('Task created');
      setQuickCreateTitle('');
      setQuickCreateColumn(null);
      fetchBoard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const filteredColumns = useMemo(() => {
    const result = {};
    COLUMNS.forEach((col) => {
      let tasks = columns[col.value] || [];
      if (search) {
        const s = search.toLowerCase();
        tasks = tasks.filter((t) => t.title?.toLowerCase().includes(s) || t.taskId?.toLowerCase().includes(s));
      }
      if (filterPriority) {
        tasks = tasks.filter((t) => t.priority === filterPriority);
      }
      if (filterAssignee) {
        tasks = tasks.filter((t) => {
          const aId = t.assignee?._id || t.assignee?.id || t.assigneeId;
          return aId === filterAssignee;
        });
      }
      result[col.value] = tasks;
    });
    return result;
  }, [columns, search, filterPriority, filterAssignee]);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Board" breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: id, href: `/projects/${id}` }, { label: 'Board' }]} />
        <KanbanCardSkeleton count={5} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Board"
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: id, href: `/projects/${id}` }, { label: 'Board' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={fetchBoard}>Refresh</Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" flexWrap="wrap">
        <TextField
          size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..." sx={{ minWidth: 240 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} label="Priority">
            <MenuItem value="">All</MenuItem>
            {Object.values(PRIORITY).map((p) => (
              <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Assignee</InputLabel>
          <Select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} label="Assignee">
            <MenuItem value="">All</MenuItem>
            {allAssignees.map((a) => {
              const name = a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Unknown';
              return (
                <MenuItem key={a._id || a.id} value={a._id || a.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={a.avatar} sx={{ width: 20, height: 20, fontSize: 10 }}>{getInitials(name)}</Avatar>
                    <Typography variant="body2">{name}</Typography>
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Stack>

      {quickCreateColumn && (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small" autoFocus fullWidth value={quickCreateTitle}
            onChange={(e) => setQuickCreateTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickCreate(); if (e.key === 'Escape') { setQuickCreateColumn(null); setQuickCreateTitle(''); } }}
            placeholder="Enter task title..."
          />
          <Button size="small" variant="contained" onClick={handleQuickCreate} disabled={!quickCreateTitle.trim()}>Create</Button>
          <Button size="small" onClick={() => { setQuickCreateColumn(null); setQuickCreateTitle(''); }}>Cancel</Button>
        </Paper>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{
          display: 'flex', gap: 2, overflow: 'auto', pb: 2,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
        }}>
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.value}
              column={col}
              tasks={filteredColumns[col.value]}
              onQuickCreate={(columnValue) => {
                setQuickCreateColumn(columnValue);
                setQuickCreateTitle('');
              }}
            />
          ))}
        </Box>
      </DragDropContext>
    </motion.div>
  );
}