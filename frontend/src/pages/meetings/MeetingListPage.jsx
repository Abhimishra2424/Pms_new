import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Fab, Avatar,
  alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { MEETING_STATUS } from '../../constants/status';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/helpers';

const MOCK_PROJECTS = [
  { id: 'p1', name: 'Website Redesign' }, { id: 'p2', name: 'Mobile App' }, { id: 'p3', name: 'Backend API' },
];

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Johnson' }, { id: 'u2', name: 'Bob Smith' },
  { id: 'u3', name: 'Carol Davis' }, { id: 'u4', name: 'David Wilson' },
  { id: 'u5', name: 'Eve Martin' },
];

const MOCK_MEETINGS = [
  { id: 1, title: 'Sprint Planning', description: 'Plan sprint 12 tasks', date: '2026-08-03', startTime: '10:00', endTime: '11:00', status: 'scheduled', project: 'p1', attendees: ['u1', 'u2', 'u3'], meetingLink: 'https://meet.google.com/abc-defg-hij' },
  { id: 2, title: 'Daily Standup', description: 'Daily sync', date: '2026-08-01', startTime: '09:00', endTime: '09:15', status: 'completed', project: 'p2', attendees: ['u1', 'u2', 'u3', 'u4'], meetingLink: '' },
  { id: 3, title: 'Design Review', description: 'Review new designs', date: '2026-08-05', startTime: '14:00', endTime: '15:00', status: 'scheduled', project: 'p1', attendees: ['u1', 'u5'], meetingLink: 'https://zoom.us/j/123456789' },
  { id: 4, title: 'Client Meeting', description: 'Quarterly review with client', date: '2026-07-28', startTime: '15:00', endTime: '16:00', status: 'completed', project: 'p3', attendees: ['u1', 'u2'], meetingLink: '' },
  { id: 5, title: 'Retrospective', description: 'Sprint retrospective', date: '2026-08-07', startTime: '11:00', endTime: '12:00', status: 'cancelled', project: 'p2', attendees: ['u1', 'u2', 'u3', 'u4', 'u5'], meetingLink: '' },
  { id: 6, title: 'Tech Guild Meeting', description: 'Cross-team tech discussion', date: '2026-08-10', startTime: '13:00', endTime: '14:00', status: 'scheduled', project: 'p3', attendees: ['u1', 'u4'], meetingLink: 'https://meet.google.com/xyz-uvw-rst' },
];

export default function MeetingListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', startTime: '', endTime: '', project: '', attendees: [], meetingLink: '',
  });
  const [filters, setFilters] = useState({ status: '', project: '', dateFrom: '', dateTo: '' });

  const statusOptions = Object.values(MEETING_STATUS).map((s) => ({ value: s.value, label: s.label }));
  const projectOptions = MOCK_PROJECTS.map((p) => ({ value: p.id, label: p.name }));
  const userOptions = MOCK_USERS.map((u) => ({ value: u.id, label: u.name }));

  const filtered = useMemo(() => {
    let list = MOCK_MEETINGS;
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    if (filters.status) list = list.filter((m) => m.status === filters.status);
    if (filters.project) list = list.filter((m) => m.project === filters.project);
    if (filters.dateFrom) list = list.filter((m) => m.date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((m) => m.date <= filters.dateTo);
    return list;
  }, [search, filters]);

  const handleCreate = () => {
    toast.success('Meeting scheduled successfully');
    setFormOpen(false);
    setFormData({ title: '', description: '', date: '', startTime: '', endTime: '', project: '', attendees: [], meetingLink: '' });
  };

  const handleDelete = () => {
    toast.success('Meeting deleted');
    setDeleteConfirm(null);
  };

  const hasActiveFilters = filters.status || filters.project || filters.dateFrom || filters.dateTo;

  const columns = useMemo(() => [
    {
      id: 'title', header: 'Title', cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <VideocamIcon sx={{ color: row.original.status === 'completed' ? 'text.disabled' : theme.palette.primary.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.original.title}</Typography>
            <Typography variant="caption" color="text.secondary">{row.original.description}</Typography>
          </Box>
        </Stack>
      ),
    },
    { id: 'date', header: 'Date', size: 120, cell: ({ row }) => <Typography variant="body2">{formatDate(row.original.date)}</Typography> },
    { id: 'time', header: 'Time', size: 120, cell: ({ row }) => <Typography variant="body2">{row.original.startTime} - {row.original.endTime}</Typography> },
    { id: 'duration', header: 'Duration', size: 80, cell: ({ row }) => {
      const diff = dayjs(`2000-01-01 ${row.original.endTime}`).diff(dayjs(`2000-01-01 ${row.original.startTime}`), 'minute');
      return <Typography variant="body2">{diff} min</Typography>;
    }},
    { id: 'status', header: 'Status', size: 110, cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={MEETING_STATUS} /> },
    { id: 'attendees', header: 'Attendees', size: 100, cell: ({ row }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <PeopleIcon fontSize="small" color="action" />
        <Typography variant="body2">{row.original.attendees.length}</Typography>
      </Stack>
    )},
    {
      id: 'actions', header: 'Actions', size: 120,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/meetings/${row.original.id}`); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [navigate, theme]);

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Meetings"
        subtitle="Schedule and manage meetings"
        breadcrumbs={[{ label: 'Meetings' }]}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search meetings..." />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant={hasActiveFilters ? 'contained' : 'outlined'} startIcon={<FilterListIcon />} onClick={() => {}} color={hasActiveFilters ? 'primary' : 'inherit'}>
            Filters {hasActiveFilters ? '(active)' : ''}
          </Button>
          {hasActiveFilters && <Button size="small" startIcon={<ClearIcon />} onClick={() => setFilters({ status: '', project: '', dateFrom: '', dateTo: '' })}>Clear</Button>}
        </Stack>
      </Stack>

      {hasActiveFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} size="small" sx={{ minWidth: 140 }}>
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField select label="Project" value={filters.project} onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))} size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {projectOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField label="From" type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <TextField label="To" type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        </Stack>
      )}

      <motion.div variants={childVariants}>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/meetings/${row.id}`)}
          emptyTitle="No meetings found"
          enableExport
          enableColumnVisibility
        />
      </motion.div>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setFormOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label="Description" multiline rows={2} value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} fullWidth />
            <TextField label="Date" type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Start Time" type="time" value={formData.startTime} onChange={(e) => setFormData((f) => ({ ...f, startTime: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="End Time" type="time" value={formData.endTime} onChange={(e) => setFormData((f) => ({ ...f, endTime: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField select label="Project" value={formData.project} onChange={(e) => setFormData((f) => ({ ...f, project: e.target.value }))} fullWidth>
              <MenuItem value="">Select Project</MenuItem>
              {MOCK_PROJECTS.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <TextField select label="Attendees" value={formData.attendees} onChange={(e) => setFormData((f) => ({ ...f, attendees: e.target.value }))} SelectProps={{ multiple: true }} fullWidth>
              {MOCK_USERS.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </TextField>
            <TextField label="Meeting Link (optional)" value={formData.meetingLink} onChange={(e) => setFormData((f) => ({ ...f, meetingLink: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={!formData.title || !formData.date}>Schedule</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Meeting"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
