import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Switch, Avatar, Typography, Stack, Tooltip, Fab, Chip,
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
  fetchDepartmentsStart, fetchDepartmentsSuccess, fetchDepartmentsFailure,
  updateDepartmentStart, updateDepartmentSuccess, updateDepartmentFailure,
  deleteDepartmentStart, deleteDepartmentSuccess, deleteDepartmentFailure,
  setDepartmentPage,
} from '../../redux/slices/departmentSlice';
import { getDepartments, updateDepartment, deleteDepartment } from '../../api/companyApi';
import { getInitials, generateAvatarColor, formatRelativeTime } from '../../utils/helpers';
import DepartmentFormPage from './DepartmentFormPage';

export default function DepartmentListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments, loading, pagination } = useSelector((state) => state.department);
  const { company } = useSelector((state) => state.company);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    dispatch(fetchDepartmentsStart());
    try {
      const { data } = await getDepartments({ page: 1, limit: 100, search });
      dispatch(fetchDepartmentsSuccess(data));
    } catch (err) {
      dispatch(fetchDepartmentsFailure(err.response?.data?.message || err.message));
    }
  }, [dispatch, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusToggle = async (dept) => {
    const newStatus = dept.status === 'active' ? 'inactive' : 'active';
    dispatch(updateDepartmentStart());
    try {
      const { data } = await updateDepartment(dept._id || dept.id, { ...dept, status: newStatus });
      dispatch(updateDepartmentSuccess(data));
      toast.success(`Department ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      dispatch(updateDepartmentFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    const id = deleteConfirm._id || deleteConfirm.id;
    dispatch(deleteDepartmentStart());
    try {
      await deleteDepartment(id);
      dispatch(deleteDepartmentSuccess(id));
      toast.success('Department deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      dispatch(deleteDepartmentFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleEdit = (e, dept) => {
    e.stopPropagation();
    setSelectedDept(dept);
    setFormOpen(true);
  };

  const handleDeleteClick = (e, dept) => {
    e.stopPropagation();
    setDeleteConfirm(dept);
  };

  const handleAdd = () => {
    setSelectedDept(null);
    setFormOpen(true);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight={600}>{row.original.name}</Typography>
      ),
    },
    {
      id: 'head',
      header: 'Head',
      cell: ({ row }) => {
        const head = row.original.headId;
        if (!head) return <Typography variant="body2" color="text.disabled">Not assigned</Typography>;
        const name = typeof head === 'object' ? `${head.firstName} ${head.lastName}` : 'Unknown';
        const avatar = typeof head === 'object' && head.avatar;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={avatar} sx={{ width: 28, height: 28, bgcolor: generateAvatarColor(name), fontSize: 12 }}>
              {getInitials(name)}
            </Avatar>
            <Typography variant="body2">{name}</Typography>
          </Stack>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.original.description || '-'}
        </Typography>
      ),
    },
    {
      id: 'employeesCount',
      header: 'Employees',
      cell: ({ row }) => (
        <Chip label={row.original.employeesCount || row.original.employeeCount || 0} size="small" variant="outlined" />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Switch
          checked={row.original.status !== 'inactive'}
          onChange={() => handleStatusToggle(row.original)}
          size="small"
          color={row.original.status === 'inactive' ? 'default' : 'success'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => handleEdit(e, row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row.original)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [handleStatusToggle]);

  const filtered = useMemo(() => {
    if (!departments) return [];
    if (!search) return departments;
    const q = search.toLowerCase();
    return departments.filter((d) =>
      d.name?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }, [departments, search]);

  if (loading && !departments?.length) {
    return (
      <Box>
        <PageHeader title="Departments" subtitle="Manage departments" breadcrumbs={[{ label: 'Company', href: '/company/settings' }, { label: 'Departments' }]} />
        <CardSkeleton count={3} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Departments"
        subtitle="Manage all departments in your organization"
        breadcrumbs={[
          { label: 'Company', href: '/company/settings' },
          { label: 'Departments' },
        ]}
      />

      <Box sx={{ mb: 2 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search departments..." />
      </Box>

      {filtered.length === 0 && !loading ? (
        <EmptyState
          title="No departments found"
          description={search ? 'Try a different search term' : 'Create your first department to get started'}
          actionText="Add Department"
          actionIcon={<AddIcon />}
          onAction={handleAdd}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => {
            setSelectedDept(row);
            setFormOpen(true);
          }}
          emptyTitle="No departments found"
          emptyDescription={search ? 'Try adjusting your search' : 'Click + to add a department'}
          enableExport
          enableColumnVisibility
        />
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={handleAdd}
      >
        <AddIcon />
      </Fab>

      <DepartmentFormPage
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedDept(null); }}
        department={selectedDept}
        companyId={company?._id || company?.id}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
