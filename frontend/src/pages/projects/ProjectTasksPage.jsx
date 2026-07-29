import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Button, Chip, Avatar, IconButton, Tooltip,
  MenuItem, TextField, Alert, LinearProgress, Select, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getTasks, updateTask, deleteTask } from '../../api/taskApi';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import { formatDate, getInitials, generateAvatarColor } from '../../utils/helpers';

export default function ProjectTasksPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', assigneeId: '' });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { projectId, search, limit: 200, ...filters };
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const { data } = await getTasks(clean);
      setTasks(data?.data || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, search, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleBulkAction = async (action) => {
    const ids = selectedRows;
    if (ids.length === 0) return;
    try {
      if (action === 'delete') {
        await Promise.all(ids.map((id) => deleteTask(id)));
        toast.success(`${ids.length} tasks deleted`);
      } else {
        await Promise.all(ids.map((id) => updateTask(id, { status: action })));
        toast.success(`${ids.length} tasks updated`);
      }
      fetchTasks();
      setSelectedRows([]);
    } catch {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleDelete = async () => {
    const id = deleteConfirm._id || deleteConfirm.id;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      toast.success('Task deleted');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleExportCSV = () => {
    if (!tasks?.length) return;
    const headers = ['Task ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Story Points', 'Labels'];
    const rows = tasks.map((t) => [
      t.taskId || '',
      `"${t.title?.replace(/"/g, '""') || ''}"`,
      t.status || '',
      t.priority || '',
      t.assignee?.name || `${t.assignee?.firstName || ''} ${t.assignee?.lastName || ''}`.trim() || '',
      t.dueDate ? formatDate(t.dueDate) : '',
      t.storyPoints ?? '',
      (t.labels || []).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tasks-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const allAssignees = useMemo(() => {
    return tasks
      .map((t) => t.assignee)
      .filter(Boolean)
      .filter((a, i, arr) => arr.findIndex((x) => (x._id || x.id) === (a._id || a.id)) === i);
  }, [tasks]);

  const columns = useMemo(() => [
    {
      id: 'taskId',
      header: 'ID',
      size: 100,
      cell: ({ row }) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.secondary' }}>
          {row.original.taskId || (row.original._id || '').slice(-6).toUpperCase()}
        </Typography>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight={500} sx={{
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        }}>
          {row.original.title}
        </Typography>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={TASK_STATUS} size="small" />,
    },
    {
      id: 'priority',
      header: 'Priority',
      size: 100,
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} size="small" />,
    },
    {
      id: 'assignee',
      header: 'Assignee',
      size: 150,
      cell: ({ row }) => {
        const a = row.original.assignee;
        if (!a) return <Typography variant="body2" color="text.disabled">Unassigned</Typography>;
        const name = a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Unknown';
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={a.avatar} sx={{ width: 26, height: 26, fontSize: 11, bgcolor: generateAvatarColor(name) }}>
              {getInitials(name)}
            </Avatar>
            <Typography variant="body2">{name}</Typography>
          </Stack>
        );
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      size: 110,
      cell: ({ row }) => {
        if (!row.original.dueDate) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const isOverdue = dayjs(row.original.dueDate).isBefore(dayjs()) && row.original.status !== 'done';
        return (
          <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'} fontWeight={isOverdue ? 600 : 400}>
            {formatDate(row.original.dueDate)}
          </Typography>
        );
      },
    },
    {
      id: 'storyPoints',
      header: 'Points',
      size: 70,
      cell: ({ row }) => row.original.storyPoints ? (
        <Chip label={row.original.storyPoints} size="small" sx={{ fontWeight: 600, minWidth: 32 }} />
      ) : '-',
    },
    {
      id: 'labels',
      header: 'Labels',
      size: 140,
      cell: ({ row }) => {
        const labels = row.original.labels || [];
        if (labels.length === 0) return <Typography variant="body2" color="text.disabled">-</Typography>;
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {labels.slice(0, 3).map((l) => (
              <Chip key={l} label={l} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            ))}
            {labels.length > 3 && <Chip label={`+${labels.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
          </Stack>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${projectId}/tasks/${row.original._id || row.original.id}`); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [navigate, projectId]);

  const hasFilters = filters.status || filters.priority || filters.assigneeId;

  const statusOptions = Object.values(TASK_STATUS).map((s) => ({ value: s.value, label: s.label }));
  const priorityOptions = Object.values(PRIORITY).map((p) => ({ value: p.value, label: p.label }));

  if (loading && !tasks.length) {
    return (
      <Box>
        <PageHeader title="Tasks" breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: projectId, href: `/projects/${projectId}` }, { label: 'Tasks' }]} />
        <TableSkeleton rows={6} columns={7} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Project Tasks"
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} in this project`}
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: projectId, href: `/projects/${projectId}` }, { label: 'Tasks' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={!tasks.length}>
              Export CSV
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." />
        </Box>
        <Button
          variant={hasFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          color={hasFilters ? 'primary' : 'inherit'}
        >
          Filters {hasFilters ? '(active)' : ''}
        </Button>
        {hasFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={() => { setFilters({ status: '', priority: '', assigneeId: '' }); setSearch(''); }}>
            Clear
          </Button>
        )}
      </Stack>

      {showFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} label="Status">
              <MenuItem value="">All</MenuItem>
              {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} label="Priority">
              <MenuItem value="">All</MenuItem>
              {priorityOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Assignee</InputLabel>
            <Select value={filters.assigneeId} onChange={(e) => setFilters((f) => ({ ...f, assigneeId: e.target.value }))} label="Assignee">
              <MenuItem value="">All</MenuItem>
              {allAssignees.map((a) => {
                const name = a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Unknown';
                return <MenuItem key={a._id || a.id} value={a._id || a.id}>{name}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Stack>
      )}

      {selectedRows.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              {Object.values(TASK_STATUS).map((s) => (
                <Button key={s.value} size="small" onClick={() => handleBulkAction(s.value)}>
                  {s.label}
                </Button>
              ))}
              <Button size="small" color="error" onClick={() => handleBulkAction('delete')}>Delete</Button>
            </Stack>
          }
        >
          {selectedRows.length} task(s) selected
        </Alert>
      )}

      {!tasks.length && !loading ? (
        <EmptyState
          title="No tasks found"
          description={search || hasFilters ? 'Try adjusting your search or filters' : 'No tasks in this project yet'}
          actionText="Create Task"
          actionIcon={<AddIcon />}
          onAction={() => navigate(`/projects/${projectId}/board`)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          loading={loading}
          enableRowSelection
          onSelectedRowIdsChange={setSelectedRows}
          onRowClick={(row) => navigate(`/projects/${projectId}/tasks/${row._id || row.id}`)}
          emptyTitle="No tasks found"
          enableExport={false}
          enableColumnVisibility
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Task"
        message={`Delete "${deleteConfirm?.title}"?`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}