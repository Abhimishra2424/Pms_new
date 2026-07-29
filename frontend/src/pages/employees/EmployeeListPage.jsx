import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, IconButton, Avatar, Typography, Stack, Tooltip, Chip, Button,
  MenuItem, TextField, Fab, Alert, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure,
  updateEmployeeStart, updateEmployeeSuccess, updateEmployeeFailure,
  deleteEmployeeStart, deleteEmployeeSuccess, deleteEmployeeFailure,
  setEmployeeFilters,
} from '../../redux/slices/employeeSlice';
import { getEmployees, updateEmployee, deleteEmployee } from '../../api/companyApi';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { ROLE_LABELS } from '../../constants/roles';
import EmployeeFormPage from './EmployeeFormPage';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
];

export default function EmployeeListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading, pagination, filters } = useSelector((state) => state.employee);
  const { departments } = useSelector((state) => state.department);
  const { designations } = useSelector((state) => state.designation);
  const { company } = useSelector((state) => state.company);

  const [localSearch, setLocalSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchData = useCallback(async () => {
    dispatch(fetchEmployeesStart());
    try {
      const params = { page: 1, limit: 100, search: localSearch, ...filters };
      const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));
      const { data } = await getEmployees(clean);
      dispatch(fetchEmployeesSuccess(data));
    } catch (err) {
      dispatch(fetchEmployeesFailure(err.response?.data?.message || err.message));
    }
  }, [dispatch, localSearch, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusToggle = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    dispatch(updateEmployeeStart());
    try {
      const { data } = await updateEmployee(emp._id || emp.id, { ...emp, status: newStatus });
      dispatch(updateEmployeeSuccess(data));
      toast.success(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      dispatch(updateEmployeeFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    const id = deleteConfirm._id || deleteConfirm.id;
    dispatch(deleteEmployeeStart());
    try {
      await deleteEmployee(id);
      dispatch(deleteEmployeeSuccess(id));
      toast.success('Employee deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      dispatch(deleteEmployeeFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleBulkAction = async (action) => {
    const ids = selectedRows;
    if (ids.length === 0) return;
    const newStatus = action === 'activate' ? 'active' : 'inactive';
    try {
      await Promise.all(ids.map((id) => updateEmployee(id, { status: newStatus })));
      toast.success(`${ids.length} employees ${action}d successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleExportCSV = () => {
    if (!employees?.length) return;
    const csvRows = [];
    const headers = ['Name', 'Employee ID', 'Email', 'Department', 'Designation', 'Role', 'Status'];
    csvRows.push(headers.join(','));
    employees.forEach((emp) => {
      const row = [
        `"${emp.firstName} ${emp.lastName}"`,
        emp.employeeId || '',
        emp.email || '',
        emp.departmentId?.name || '',
        emp.designationId?.title || '',
        ROLE_LABELS[emp.role] || emp.role || '',
        emp.status || '',
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeptName = (deptId) => {
    if (!deptId || !departments) return '-';
    const id = typeof deptId === 'object' ? deptId._id || deptId.id : deptId;
    return departments.find((d) => (d._id || d.id) === id)?.name || '-';
  };

  const getDesigTitle = (desigId) => {
    if (!desigId || !designations) return '-';
    const id = typeof desigId === 'object' ? desigId._id || desigId.id : desigId;
    return designations.find((d) => (d._id || d.id) === id)?.title || '-';
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original;
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={emp.avatar} sx={{ width: 36, height: 36, bgcolor: generateAvatarColor(name), fontSize: 14 }}>
              {getInitials(name)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      size: 120,
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <Chip label={getDeptName(row.original.departmentId)} size="small" variant="outlined" />
      ),
    },
    {
      id: 'designation',
      header: 'Designation',
      cell: ({ row }) => (
        <Typography variant="body2">{getDesigTitle(row.original.designationId)}</Typography>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      size: 130,
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.role}
          statusMap={Object.entries(ROLE_LABELS).reduce((acc, [key, val]) => {
            acc[key] = { value: key, label: val, color: 'info' };
            return acc;
          }, {})}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      cell: ({ row }) => (
        <Chip
          label={row.original.status || 'active'}
          size="small"
          color={row.original.status === 'active' ? 'success' : row.original.status === 'suspended' ? 'warning' : 'default'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/company/employees/${row.original._id || row.original.id}`); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(row.original); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.original.status === 'active' ? 'Deactivate' : 'Activate'}>
            <IconButton size="small" color={row.original.status === 'active' ? 'warning' : 'success'} onClick={(e) => { e.stopPropagation(); handleStatusToggle(row.original); }}>
              {row.original.status === 'active' ? <ClearIcon fontSize="small" /> : <AddIcon fontSize="small" />}
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
  ], [departments, designations, navigate]);

  const handleFilterChange = (key, value) => {
    dispatch(setEmployeeFilters({ [key]: value }));
  };

  const clearFilters = () => {
    dispatch(setEmployeeFilters({ departmentId: '', designationId: '', role: '', status: '' }));
    setLocalSearch('');
  };

  const hasActiveFilters = filters?.departmentId || filters?.designationId || filters?.role || filters?.status;

  if (loading && !employees?.length) {
    return (
      <Box>
        <PageHeader title="Employees" subtitle="Manage all employees" breadcrumbs={[{ label: 'Company', href: '/company/settings' }, { label: 'Employees' }]} />
        <CardSkeleton count={3} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Employees"
        subtitle="Manage all employees in your organization"
        breadcrumbs={[
          { label: 'Company', href: '/company/settings' },
          { label: 'Employees' },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV} disabled={!employees?.length}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedEmployee(null); setFormOpen(true); }}>
              Add Employee
            </Button>
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={localSearch} onChange={setLocalSearch} placeholder="Search by name, email, or ID..." />
        </Box>
        <Button
          variant={hasActiveFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          color={hasActiveFilters ? 'primary' : 'inherit'}
        >
          Filters {hasActiveFilters ? '(active)' : ''}
        </Button>
        {hasActiveFilters && (
          <Button size="small" startIcon={<ClearIcon />} onClick={clearFilters}>Clear</Button>
        )}
      </Stack>

      <Collapse in={showFilters}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            select
            label="Department"
            value={filters?.departmentId || ''}
            onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments?.map((d) => (
              <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Designation"
            value={filters?.designationId || ''}
            onChange={(e) => handleFilterChange('designationId', e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Designations</MenuItem>
            {designations?.map((d) => (
              <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Role"
            value={filters?.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={filters?.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All Status</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Collapse>

      {selectedRows.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} action={
          <Stack direction="row" spacing={1}>
            <Button size="small" color="success" onClick={() => handleBulkAction('activate')}>Activate All</Button>
            <Button size="small" color="warning" onClick={() => handleBulkAction('deactivate')}>Deactivate All</Button>
          </Stack>
        }>
          {selectedRows.length} employee(s) selected
        </Alert>
      )}

      {!employees?.length && !loading ? (
        <EmptyState
          title="No employees found"
          description={localSearch || hasActiveFilters ? 'Try adjusting your search or filters' : 'Add your first employee to get started'}
          actionText="Add Employee"
          actionIcon={<AddIcon />}
          onAction={() => { setSelectedEmployee(null); setFormOpen(true); }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={employees || []}
          loading={loading}
          enableRowSelection
          onSelectedRowIdsChange={setSelectedRows}
          onRowClick={(row) => navigate(`/company/employees/${row._id || row.id}`)}
          emptyTitle="No employees found"
          enableExport
          enableColumnVisibility
        />
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => { setSelectedEmployee(null); setFormOpen(true); }}
      >
        <AddIcon />
      </Fab>

      <EmployeeFormPage
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
        companyId={company?._id || company?.id}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteConfirm?.firstName} ${deleteConfirm?.lastName}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
