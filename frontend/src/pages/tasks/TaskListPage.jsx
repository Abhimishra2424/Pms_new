import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Typography, Stack, Tooltip, Button,
  Chip, Avatar, ToggleButtonGroup, ToggleButton,
  Checkbox, alpha, useTheme, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineIcon from '@mui/icons-material/Timeline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton, KanbanCardSkeleton } from '../../components/common/SkeletonLoader';
import FilterDrawer, { FilterSelect, FilterDateRange, FilterMultiSelect } from '../../components/common/FilterDrawer';
import TaskFormDialog from './TaskFormDialog';
import TaskCalendarView from './TaskCalendarView';
import TaskTimelineView from './TaskTimelineView';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

const STATUS_OPTIONS = Object.values(TASK_STATUS).map((s) => ({ value: s.value, label: s.label }));
const PRIORITY_OPTIONS = Object.values(PRIORITY).map((p) => ({ value: p.value, label: p.label }));

const QUICK_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'my', label: 'My Tasks' },
  { key: 'due_today', label: 'Due Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'done', label: 'Completed' },
];

export default function TaskListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [quickFilter, setQuickFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [filters, setFilters] = useState({
    status: '', priority: '', projectId: '', assigneeId: '',
    dueDateStart: '', dueDateEnd: '', labels: [],
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, ...filters };
      if (quickFilter === 'my') params.assigneeId = 'me';
      if (quickFilter === 'due_today') {
        params.dueDateStart = dayjs().format('YYYY-MM-DD');
        params.dueDateEnd = dayjs().format('YYYY-MM-DD');
      }
      if (quickFilter === 'overdue') params.overdue = true;
      if (quickFilter === 'done') params.status = 'done';
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null));
      const { data: taskRes } = await import('../../api/taskApi').then((m) => m.getTasks(clean));
      const { data: projectRes } = await import('../../api/projectApi').then((m) => m.getProjects({ limit: 100 }));
      const { data: employeeRes } = await import('../../api/companyApi').then((m) => m.getEmployees({ limit: 100 }));
      setTasks(taskRes?.data || taskRes || []);
      setProjects(projectRes?.data || projectRes || []);
      setEmployees(employeeRes?.data || employeeRes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [search, filters, quickFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const boardColumns = useMemo(() => {
    const cols = {};
    Object.values(TASK_STATUS).forEach((s) => { cols[s.value] = []; });
    tasks.forEach((t) => {
      const status = t.status || 'backlog';
      if (cols[status]) cols[status].push(t);
      else cols.backlog.push(t);
    });
    return cols;
  }, [tasks]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = { ...boardColumns };
    const [movedTask] = newColumns[source.droppableId].splice(source.index, 1);
    newColumns[destination.droppableId].splice(destination.index, 0, movedTask);

    const task = tasks.find((t) => (t._id || t.id) === draggableId);
    if (task && task.status !== destination.droppableId) {
      try {
        const { updateTask } = await import('../../api/taskApi');
        await updateTask(draggableId, { status: destination.droppableId });
        setTasks((prev) => prev.map((t) =>
          (t._id || t.id) === draggableId ? { ...t, status: destination.droppableId } : t
        ));
        toast.success(`Task moved to ${TASK_STATUS[destination.droppableId.toUpperCase()]?.label || destination.droppableId}`);
      } catch {
        fetchTasks();
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { deleteTask } = await import('../../api/taskApi');
      await Promise.all(selectedTasks.map((id) => deleteTask(id)));
      setTasks((prev) => prev.filter((t) => !selectedTasks.includes(t._id || t.id)));
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks deleted`);
    } catch (err) {
      toast.error('Failed to delete tasks');
    }
    setBulkMenuAnchor(null);
  };

  const handleBulkStatus = async (status) => {
    try {
      const { updateTask } = await import('../../api/taskApi');
      await Promise.all(selectedTasks.map((id) => updateTask(id, { status })));
      setTasks((prev) => prev.map((t) =>
        selectedTasks.includes(t._id || t.id) ? { ...t, status } : t
      ));
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks updated`);
    } catch {
      toast.error('Failed to update tasks');
    }
    setBulkMenuAnchor(null);
  };

  const handleSelectTask = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => t._id || t.id));
    }
  };

  const hasActiveFilters = filters.status || filters.priority || filters.projectId || filters.assigneeId || filters.dueDateStart || filters.dueDateEnd || filters.labels.length;

  const resetFilters = () => {
    setFilters({ status: '', priority: '', projectId: '', assigneeId: '', dueDateStart: '', dueDateEnd: '', labels: [] });
    setSearch('');
    setQuickFilter('all');
  };

  const projectOptions = projects.map((p) => ({ value: p._id || p.id, label: p.name }));
  const employeeOptions = employees.map((e) => {
    const name = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim();
    return { value: e._id || e.id, label: name };
  });

  const columns = useMemo(() => [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedTasks.length === tasks.length && tasks.length > 0}
          indeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
          onChange={toggleSelectAll}
          size="small"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedTasks.includes(row.original._id || row.original.id)}
          onChange={() => handleSelectTask(row.original._id || row.original.id)}
          size="small"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 48,
      enableSorting: false,
    },
    {
      id: 'id',
      header: 'ID',
      size: 100,
      cell: ({ row }) => (
        <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontWeight={600}>
          {row.original.taskId || row.original._id?.slice(-6) || `TASK-${String(row.original.id || '').slice(0, 6)}`}
        </Typography>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 6, height: 6, borderRadius: '50%',
              bgcolor: row.original.priority === 'highest' || row.original.priority === 'high' ? 'error.main' :
                row.original.priority === 'medium' ? 'warning.main' : 'text.disabled',
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 280 }}>
            {row.original.title}
          </Typography>
          {row.original.labels?.slice(0, 2).map((label) => (
            <Chip key={label} label={label} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          ))}
          {row.original.labels?.length > 2 && (
            <Typography variant="caption" color="text.disabled">+{row.original.labels.length - 2}</Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'project',
      header: 'Project',
      size: 140,
      cell: ({ row }) => {
        const project = row.original.project || row.original.projectId;
        const name = project?.name || (typeof project === 'string' ? project : '');
        return name ? (
          <Chip label={name} size="small" variant="filled" color="primary" sx={{ fontWeight: 500, maxWidth: 140 }} />
        ) : (
          <Typography variant="body2" color="text.disabled">-</Typography>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={TASK_STATUS} />,
    },
    {
      id: 'priority',
      header: 'Priority',
      size: 110,
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: 'assignee',
      header: 'Assignee',
      size: 160,
      cell: ({ row }) => {
        const assignee = row.original.assignee || row.original.assigneeId;
        if (!assignee) return <Typography variant="body2" color="text.disabled">Unassigned</Typography>;
        const name = assignee.name || `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'User';
        const avatarUrl = assignee.avatar || assignee.profilePicture;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={avatarUrl} sx={{ width: 24, height: 24, fontSize: 10, bgcolor: avatarUrl ? 'transparent' : generateAvatarColor(name) }}>
              {getInitials(name)}
            </Avatar>
            <Typography variant="body2" noWrap>{name}</Typography>
          </Stack>
        );
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      size: 120,
      accessorKey: 'dueDate',
      cell: ({ row }) => {
        const date = row.original.dueDate;
        if (!date) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day') && row.original.status !== 'done';
        return (
          <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'} fontWeight={isOverdue ? 600 : 400}>
            {formatDate(date)}
          </Typography>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      size: 120,
      cell: ({ row }) => (
        <Typography variant="caption" color="text.secondary">
          {formatRelativeTime(row.original.createdAt)}
        </Typography>
      ),
    },
  ], [selectedTasks, tasks.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  if (loading && !tasks.length && viewMode !== 'board') {
    return (
      <Box>
        <PageHeader title="All Tasks" subtitle="View and manage all tasks across projects" breadcrumbs={[{ label: 'Tasks', href: '/tasks' }, { label: 'All Tasks' }]} />
        <TableSkeleton rows={6} columns={8} />
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="All Tasks"
        subtitle="View and manage all tasks across projects"
        breadcrumbs={[{ label: 'Tasks', href: '/tasks' }, { label: 'All Tasks' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
              <ToggleButton value="table" title="Table"><TableRowsIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="board" title="Board"><ViewKanbanIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="calendar" title="Calendar"><CalendarMonthIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="timeline" title="Timeline"><TimelineIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              New Task
            </Button>
          </Stack>
        }
      />

      {viewMode === 'table' || viewMode === 'board' ? (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1, maxWidth: 360 }}>
              <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." />
            </Box>
            <Stack direction="row" spacing={1} overflow="auto" sx={{ pb: 0.5 }}>
              {QUICK_FILTERS.map((qf) => (
                <Chip
                  key={qf.key}
                  label={qf.label}
                  size="small"
                  variant={quickFilter === qf.key ? 'filled' : 'outlined'}
                  color={quickFilter === qf.key ? 'primary' : 'default'}
                  onClick={() => setQuickFilter(qf.key)}
                  sx={{ cursor: 'pointer', fontWeight: quickFilter === qf.key ? 600 : 400, flexShrink: 0 }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant={hasActiveFilters ? 'contained' : 'outlined'}
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen(true)}
                color={hasActiveFilters ? 'primary' : 'inherit'}
                size="small"
              >
                Filters {hasActiveFilters ? `(${Object.values(filters).filter((v) => v !== '' && !(Array.isArray(v) && v.length === 0)).length})` : ''}
              </Button>
              {hasActiveFilters && (
                <Button size="small" startIcon={<ClearIcon />} onClick={resetFilters}>Clear</Button>
              )}
            </Stack>
          </Stack>

          {selectedTasks.length > 0 && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 1.5, py: 1,
                borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {selectedTasks.length} selected
              </Typography>
              <Button
                size="small"
                variant="outlined"
                endIcon={<MoreVertIcon />}
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
              >
                Bulk Actions
              </Button>
              <IconButton size="small" color="error" onClick={handleBulkDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={bulkMenuAnchor}
                open={Boolean(bulkMenuAnchor)}
                onClose={() => setBulkMenuAnchor(null)}
              >
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
                  Change Status
                </Typography>
                {Object.values(TASK_STATUS).map((s) => (
                  <MenuItem key={s.value} onClick={() => handleBulkStatus(s.value)} dense>
                    <ListItemIcon><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${s.color}.main` }} /></ListItemIcon>
                    <ListItemText primary={s.label} />
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleBulkDelete} dense>
                  <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText primary="Delete" />
                </MenuItem>
              </Menu>
            </Box>
          )}

          {viewMode === 'table' ? (
            !tasks.length && !loading ? (
              <EmptyState
                title="No tasks found"
                description={search || hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
                actionText="New Task"
                actionIcon={<AddIcon />}
                onAction={() => setFormOpen(true)}
              />
            ) : (
              <DataTable
                columns={columns}
                data={tasks}
                loading={loading}
                onRowClick={(row) => navigate(`/tasks/${row._id || row.id}`)}
                emptyTitle="No tasks found"
                enableExport
                enableColumnVisibility
              />
            )
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', pb: 2, minHeight: 'calc(100vh - 300px)' }}>
                {Object.entries(boardColumns).map(([status, statusTasks]) => {
                  const statusConfig = Object.values(TASK_STATUS).find((s) => s.value === status);
                  return (
                    <Box key={status} sx={{ minWidth: 280, maxWidth: 320, flex: 1 }}>
                      <Box sx={{ px: 1.5, py: 1, mb: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${statusConfig?.color || 'grey'}.main` }} />
                            <Typography variant="subtitle2" fontWeight={600}>
                              {statusConfig?.label || status}
                            </Typography>
                            <Chip label={statusTasks.length} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                          </Stack>
                        </Stack>
                      </Box>
                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                              minHeight: 200,
                              borderRadius: 2,
                              bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.05) : 'action.hover',
                              p: 1,
                              transition: 'background-color 0.2s',
                            }}
                          >
                            {loading && !statusTasks.length ? (
                              <KanbanCardSkeleton count={2} />
                            ) : statusTasks.length === 0 && !loading ? (
                              <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.disabled">No tasks</Typography>
                              </Box>
                            ) : (
                              statusTasks.map((task, index) => {
                                const assignee = task.assignee || task.assigneeId;
                                const assigneeName = assignee?.name || `${assignee?.firstName || ''} ${assignee?.lastName || ''}`.trim() || '';
                                return (
                                  <Draggable key={task._id || task.id} draggableId={task._id || task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        sx={{
                                          p: 1.5, mb: 1, borderRadius: 2,
                                          bgcolor: 'background.paper',
                                          border: '1px solid',
                                          borderColor: snapshot.isDragging ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.divider, 0.1),
                                          boxShadow: snapshot.isDragging ? 4 : 0,
                                          cursor: 'pointer',
                                          '&:hover': { borderColor: alpha(theme.palette.divider, 0.3) },
                                          transition: 'box-shadow 0.2s',
                                        }}
                                        onClick={() => navigate(`/tasks/${task._id || task.id}`)}
                                      >
                                        <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                                          <Box {...provided.dragHandleProps} sx={{ mt: 0.3, color: 'text.disabled', cursor: 'grab', display: 'flex' }}>
                                            <DragIndicatorIcon fontSize="small" />
                                          </Box>
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={500} gutterBottom noWrap>
                                              {task.title}
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
                                              <PriorityBadge priority={task.priority} size="small" />
                                              {task.labels?.slice(0, 2).map((l) => (
                                                <Chip key={l} label={l} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                                              ))}
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                              {task.dueDate ? (
                                                <Typography variant="caption" color={dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'done' ? 'error' : 'text.secondary'} fontWeight={500}>
                                                  {formatDate(task.dueDate, 'MMM DD')}
                                                </Typography>
                                              ) : (
                                                <Typography variant="caption" color="text.disabled">No due date</Typography>
                                              )}
                                              {assigneeName && (
                                                <Avatar sx={{ width: 22, height: 22, fontSize: 9, bgcolor: generateAvatarColor(assigneeName) }}>
                                                  {getInitials(assigneeName)}
                                                </Avatar>
                                              )}
                                            </Stack>
                                          </Box>
                                        </Stack>
                                      </Box>
                                    )}
                                  </Draggable>
                                );
                              })
                            )}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </Box>
                  );
                })}
              </Box>
            </DragDropContext>
          )}
        </>
      ) : viewMode === 'calendar' ? (
        <TaskCalendarView tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      ) : (
        <TaskTimelineView tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => setFilterOpen(false)}
        onReset={resetFilters}
      >
        <FilterSelect label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
        <FilterSelect label="Priority" options={PRIORITY_OPTIONS} value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} />
        <FilterSelect label="Project" options={projectOptions} value={filters.projectId} onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))} />
        <FilterSelect label="Assignee" options={employeeOptions} value={filters.assigneeId} onChange={(e) => setFilters((f) => ({ ...f, assigneeId: e.target.value }))} />
        <FilterDateRange
          startLabel="Due From"
          endLabel="Due To"
          startValue={filters.dueDateStart}
          endValue={filters.dueDateEnd}
          onStartChange={(e) => setFilters((f) => ({ ...f, dueDateStart: e.target.value }))}
          onEndChange={(e) => setFilters((f) => ({ ...f, dueDateEnd: e.target.value }))}
        />
      </FilterDrawer>

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