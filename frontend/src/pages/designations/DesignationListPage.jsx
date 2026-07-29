import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, IconButton, Typography, Stack, Tooltip, Fab, Chip, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  fetchDesignationsStart, fetchDesignationsSuccess, fetchDesignationsFailure,
  deleteDesignationStart, deleteDesignationSuccess, deleteDesignationFailure,
} from '../../redux/slices/designationSlice';
import { getDesignations, deleteDesignation } from '../../api/companyApi';
import DesignationFormModal from './DesignationFormModal';

export default function DesignationListPage() {
  const dispatch = useDispatch();
  const { designations, loading } = useSelector((state) => state.designation);
  const { departments } = useSelector((state) => state.department);
  const { company } = useSelector((state) => state.company);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    dispatch(fetchDesignationsStart());
    try {
      const { data } = await getDesignations({ page: 1, limit: 100, search });
      dispatch(fetchDesignationsSuccess(data));
    } catch (err) {
      dispatch(fetchDesignationsFailure(err.response?.data?.message || err.message));
    }
  }, [dispatch, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    const id = deleteConfirm._id || deleteConfirm.id;
    dispatch(deleteDesignationStart());
    try {
      await deleteDesignation(id);
      dispatch(deleteDesignationSuccess(id));
      toast.success('Designation deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      dispatch(deleteDesignationFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to delete designation');
    }
  };

  const getDeptName = (deptId) => {
    if (!deptId || !departments) return '-';
    const id = typeof deptId === 'object' ? deptId._id || deptId.id : deptId;
    const dept = departments.find((d) => (d._id || d.id) === id);
    return dept?.name || '-';
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight={600}>{row.original.title}</Typography>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <Chip label={getDeptName(row.original.departmentId)} size="small" variant="outlined" />
      ),
    },
    {
      accessorKey: 'level',
      header: 'Level',
      size: 80,
      cell: ({ row }) => (
        <Chip label={`L${row.original.level ?? 0}`} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'employeesCount',
      header: 'Employees',
      size: 100,
      cell: ({ row }) => (
        <Typography variant="body2">{row.original.employeesCount || row.original.employeeCount || 0}</Typography>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedDesignation(row.original); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
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
  ], [departments]);

  const filtered = useMemo(() => {
    if (!designations) return [];
    if (!search) return designations;
    const q = search.toLowerCase();
    return designations.filter((d) =>
      d.title?.toLowerCase().includes(q) ||
      getDeptName(d.departmentId)?.toLowerCase().includes(q)
    );
  }, [designations, search, departments]);

  if (loading && !designations?.length) {
    return (
      <Box>
        <PageHeader title="Designations" subtitle="Manage designations" breadcrumbs={[{ label: 'Company', href: '/company/settings' }, { label: 'Designations' }]} />
        <CardSkeleton count={3} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Designations"
        subtitle="Manage job designations and hierarchy levels"
        breadcrumbs={[
          { label: 'Company', href: '/company/settings' },
          { label: 'Designations' },
        ]}
      />

      <Box sx={{ mb: 2 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search designations..." />
      </Box>

      {filtered.length === 0 && !loading ? (
        <EmptyState
          title="No designations found"
          description={search ? 'Try a different search term' : 'Create your first designation to get started'}
          actionText="Add Designation"
          actionIcon={<AddIcon />}
          onAction={() => { setSelectedDesignation(null); setFormOpen(true); }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => { setSelectedDesignation(row); setFormOpen(true); }}
          emptyTitle="No designations found"
          enableExport
          enableColumnVisibility
        />
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => { setSelectedDesignation(null); setFormOpen(true); }}
      >
        <AddIcon />
      </Fab>

      <DesignationFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedDesignation(null); }}
        designation={selectedDesignation}
        companyId={company?._id || company?.id}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Designation"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
