import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Avatar, Typography, Stack, Tooltip, Button,
  LinearProgress, Chip, Fab, ToggleButtonGroup, ToggleButton,
  Card, CardContent, CardActions, Collapse, MenuItem, TextField,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';
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
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import AvatarGroup from '../../components/common/AvatarGroup';
import FilterDrawer, { FilterSelect, FilterDateRange } from '../../components/common/FilterDrawer';
import { getProjects, deleteProject, archiveProject } from '../../api/projectApi';
import { PROJECT_STATUS, PRIORITY } from '../../constants/status';
import { formatDate } from '../../utils/helpers';
import ProjectFormPage from './ProjectFormPage';

const PROJECT_CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'research', label: 'Research' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'internal', label: 'Internal' },
];

export default function ProjectListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '', priority: '', category: '', startDate: '', endDate: '',
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, ...filters };
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const { data } = await getProjects(clean);
      setProjects(data?.data || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async () => {
    const id = deleteConfirm._id || deleteConfirm.id;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleArchive = async () => {
    const id = archiveConfirm._id || archiveConfirm.id;
    try {
      await archiveProject(id);
      setProjects((prev) => prev.map((p) =>
        (p._id || p.id) === id ? { ...p, status: 'archived' } : p
      ));
      toast.success('Project archived successfully');
      setArchiveConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive project');
    }
  };

  const handleEdit = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setFormOpen(true);
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: row.original.color || 'primary.main', flexShrink: 0,
            }}
          />
          <Typography variant="body2" fontWeight={600}>
            {row.original.name}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'key',
      header: 'Key',
      size: 100,
      cell: ({ row }) => (
        <Chip label={row.original.key} size="small" variant="filled" color="primary" sx={{ fontWeight: 600, fontFamily: 'monospace' }} />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={PROJECT_STATUS} />,
    },
    {
      id: 'priority',
      header: 'Priority',
      size: 110,
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: 'lead',
      header: 'Lead',
      size: 160,
      cell: ({ row }) => {
        const lead = row.original.lead;
        if (!lead) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const name = lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unassigned';
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={lead.avatar} sx={{ width: 28, height: 28, fontSize: 12 }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{name}</Typography>
          </Stack>
        );
      },
    },
    {
      id: 'teamSize',
      header: 'Team',
      size: 80,
      cell: ({ row }) => {
        const members = row.original.members || row.original.teamMembers || [];
        return <AvatarGroup users={members} max={3} size={28} />;
      },
    },
    {
      id: 'tasksCount',
      header: 'Tasks',
      size: 80,
      cell: ({ row }) => (
        <Typography variant="body2" textAlign="center">
          {row.original.taskCount ?? row.original.tasksCount ?? 0}
        </Typography>
      ),
    },
    {
      id: 'progress',
      header: 'Progress',
      size: 160,
      cell: ({ row }) => {
        const progress = row.original.progress ?? 0;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36, textAlign: 'right' }}>
              {Math.round(progress)}%
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      size: 120,
      cell: ({ row }) => {
        const date = row.original.endDate || row.original.dueDate;
        if (!date) return <Typography variant="body2" color="text.disabled">-</Typography>;
        const isOverdue = dayjs(date).isBefore(dayjs()) && row.original.status !== 'completed';
        return (
          <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
            {formatDate(date)}
          </Typography>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${row.original._id || row.original.id}`); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => handleEdit(e, row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.original.status !== 'archived' && (
            <Tooltip title="Archive">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setArchiveConfirm(row.original); }}>
                <ArchiveIcon fontSize="small" color="warning" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [navigate]);

  const hasActiveFilters = filters.status || filters.priority || filters.category || filters.startDate || filters.endDate;

  const resetFilters = () => {
    setFilters({ status: '', priority: '', category: '', startDate: '', endDate: '' });
    setSearch('');
  };

  const statusOptions = Object.values(PROJECT_STATUS).map((s) => ({ value: s.value, label: s.label }));
  const priorityOptions = Object.values(PRIORITY).map((p) => ({ value: p.value, label: p.label }));

  if (loading && !projects.length) {
    return (
      <Box>
        <PageHeader title="Projects" subtitle="Manage all your projects" breadcrumbs={[{ label: 'Projects' }]} />
        <CardSkeleton count={4} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Projects"
        subtitle="Manage all your projects"
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedProject(null); setFormOpen(true); }}>
              New Project
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or key..." />
        </Box>
        <Button
          variant={hasActiveFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setFilterOpen(true)}
          color={hasActiveFilters ? 'primary' : 'inherit'}
        >
          Filters {hasActiveFilters ? '(active)' : ''}
        </Button>
        {hasActiveFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={resetFilters}>Clear</Button>
        )}
      </Stack>

      {!projects.length && !loading ? (
        <EmptyState
          title="No projects found"
          description={search || hasActiveFilters ? 'Try adjusting your search or filters' : 'Create your first project to get started'}
          actionText="New Project"
          actionIcon={<AddIcon />}
          onAction={() => { setSelectedProject(null); setFormOpen(true); }}
        />
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          onRowClick={(row) => navigate(`/projects/${row._id || row.id}`)}
          emptyTitle="No projects found"
          enableExport
          enableColumnVisibility
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 2.5 }}>
          {projects.map((project) => {
            const progress = project.progress ?? 0;
            const lead = project.lead;
            const leadName = lead?.name || `${lead?.firstName || ''} ${lead?.lastName || ''}`.trim() || 'Unassigned';
            const members = project.members || project.teamMembers || [];
            const dueDate = project.endDate || project.dueDate;
            const isOverdue = dueDate && dayjs(dueDate).isBefore(dayjs()) && project.status !== 'completed';

            return (
              <motion.div
                key={project._id || project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => navigate(`/projects/${project._id || project.id}`)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip label={project.key} size="small" color="primary" variant="filled" sx={{ fontWeight: 600, fontFamily: 'monospace', height: 22 }} />
                          <StatusBadge status={project.status} statusMap={PROJECT_STATUS} size="small" />
                          <PriorityBadge priority={project.priority} size="small" />
                        </Stack>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {project.name}
                        </Typography>
                        {project.description && (
                          <Typography variant="body2" color="text.secondary" sx={{
                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mb: 1.5,
                          }}>
                            {project.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        {lead && (
                          <Avatar src={lead.avatar} sx={{ width: 28, height: 28, fontSize: 11 }}>
                            {leadName.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <AvatarGroup users={members} max={3} size={26} />
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {dueDate && (
                          <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                            {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(dueDate)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {project.taskCount ?? project.tasksCount ?? 0} tasks
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 1 }}>
                    <IconButton size="small" onClick={(e) => handleEdit(e, project)}><EditIcon fontSize="small" /></IconButton>
                    {project.status !== 'archived' && (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setArchiveConfirm(project); }}>
                        <ArchiveIcon fontSize="small" color="warning" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      )}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => { setSelectedProject(null); setFormOpen(true); }}>
        <AddIcon />
      </Fab>

      <ProjectFormPage
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedProject(null); }}
        project={selectedProject}
        onSuccess={fetchProjects}
      />

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => setFilterOpen(false)}
        onReset={resetFilters}
      >
        <FilterSelect
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        />
        <FilterSelect
          label="Priority"
          options={priorityOptions}
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        />
        <FilterSelect
          label="Category"
          options={PROJECT_CATEGORIES}
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        />
        <FilterDateRange
          startLabel="Start Date"
          endLabel="End Date"
          startValue={filters.startDate}
          endValue={filters.endDate}
          onStartChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          onEndChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
        />
      </FilterDrawer>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        open={Boolean(archiveConfirm)}
        title="Archive Project"
        message={`Are you sure you want to archive "${archiveConfirm?.name}"?`}
        confirmText="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirm(null)}
      />
    </motion.div>
  );
}