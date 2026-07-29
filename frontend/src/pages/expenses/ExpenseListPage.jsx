import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Fab, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DevicesIcon from '@mui/icons-material/Devices';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EXPENSE_STATUS } from '../../constants/status';
import { formatDate, formatDateTime } from '../../utils/helpers';

const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel', icon: <FlightIcon />, color: '#3b82f6' },
  { value: 'meals', label: 'Meals & Entertainment', icon: <RestaurantIcon />, color: '#22c55e' },
  { value: 'office_supplies', label: 'Office Supplies', icon: <ShoppingCartIcon />, color: '#f97316' },
  { value: 'transportation', label: 'Transportation', icon: <DirectionsCarIcon />, color: '#a855f7' },
  { value: 'equipment', label: 'Equipment', icon: <DevicesIcon />, color: '#06b6d4' },
  { value: 'other', label: 'Other', icon: <AccountBalanceWalletIcon />, color: '#64748b' },
];

const MOCK_PROJECTS = [{ id: 'p1', name: 'Website Redesign' }, { id: 'p2', name: 'Mobile App' }];
const MOCK_USERS = [{ id: 'u1', name: 'Alice Johnson' }, { id: 'u2', name: 'Bob Smith' }];

const MOCK_EXPENSES = [
  { id: 1, date: '2026-07-28', description: 'Flight to client meeting', category: 'travel', amount: 450, project: 'p1', user: 'Alice Johnson', status: 'approved' },
  { id: 2, date: '2026-07-27', description: 'Team lunch', category: 'meals', amount: 120, project: 'p2', user: 'Bob Smith', status: 'pending' },
  { id: 3, date: '2026-07-26', description: 'Office chair', category: 'office_supplies', amount: 350, project: 'p1', user: 'Alice Johnson', status: 'approved' },
  { id: 4, date: '2026-07-25', description: 'Uber rides', category: 'transportation', amount: 45, project: 'p2', user: 'Bob Smith', status: 'rejected' },
  { id: 5, date: '2026-07-24', description: 'Monitor', category: 'equipment', amount: 299, project: 'p1', user: 'Alice Johnson', status: 'pending' },
  { id: 6, date: '2026-07-23', description: 'Coffee supplies', category: 'other', amount: 35, project: 'p2', user: 'Bob Smith', status: 'approved' },
];

export default function ExpenseListPage() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ date: '', description: '', category: 'travel', amount: '', project: '' });
  const [filters, setFilters] = useState({ category: '', status: '', project: '', dateFrom: '', dateTo: '' });

  const statusOptions = Object.values(EXPENSE_STATUS).map((s) => ({ value: s.value, label: s.label }));
  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
  const projectOptions = MOCK_PROJECTS.map((p) => ({ value: p.id, label: p.name }));

  const filtered = useMemo(() => {
    let list = MOCK_EXPENSES;
    if (search) list = list.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase()));
    if (filters.category) list = list.filter((e) => e.category === filters.category);
    if (filters.status) list = list.filter((e) => e.status === filters.status);
    if (filters.project) list = list.filter((e) => e.project === filters.project);
    if (filters.dateFrom) list = list.filter((e) => e.date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((e) => e.date <= filters.dateTo);
    return list;
  }, [search, filters]);

  const categorySummary = useMemo(() => {
    const map = {};
    MOCK_EXPENSES.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([cat, total]) => {
      const cfg = EXPENSE_CATEGORIES.find((c) => c.value === cat);
      return { name: cfg?.label || cat, amount: total, color: cfg?.color || '#64748b' };
    });
  }, []);

  const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleCreate = () => { toast.success('Expense added'); setFormOpen(false); };
  const handleApprove = (id, status) => { toast.success(`Expense ${status}`); };
  const handleDelete = () => { toast.success('Expense deleted'); setDeleteConfirm(null); };

  const hasActiveFilters = filters.category || filters.status || filters.project || filters.dateFrom || filters.dateTo;

  const columns = useMemo(() => [
    { id: 'date', header: 'Date', size: 110, cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'category', header: 'Category', size: 160,
      cell: ({ row }) => {
        const cat = EXPENSE_CATEGORIES.find((c) => c.value === row.original.category);
        return <Chip icon={cat?.icon} label={cat?.label || row.original.category} size="small" sx={{ bgcolor: alpha(cat?.color || '#64748b', 0.12), color: cat?.color || '#64748b', fontWeight: 600 }} />;
      },
    },
    { id: 'amount', header: 'Amount', size: 100, cell: ({ row }) => <Typography fontWeight={600}>${row.original.amount.toFixed(2)}</Typography> },
    { id: 'project', header: 'Project', size: 140, cell: ({ row }) => {
      const p = MOCK_PROJECTS.find((pr) => pr.id === row.original.project);
      return <Chip label={p?.name || '-'} size="small" variant="outlined" />;
    }},
    { accessorKey: 'user', header: 'User', size: 130 },
    { id: 'status', header: 'Status', size: 110, cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={EXPENSE_STATUS} /> },
    {
      id: 'actions', header: 'Actions', size: 130,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {row.original.status === 'pending' && (
            <>
              <Tooltip title="Approve"><IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleApprove(row.original.id, 'approved'); }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Reject"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleApprove(row.original.id, 'rejected'); }}><BlockIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Expenses"
        subtitle="Track and manage expenses"
        breadcrumbs={[{ label: 'Expenses' }]}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant={hasActiveFilters ? 'contained' : 'outlined'} startIcon={<FilterListIcon />} onClick={() => {}} color={hasActiveFilters ? 'primary' : 'inherit'}>
            Filters {hasActiveFilters ? '(active)' : ''}
          </Button>
          {hasActiveFilters && <Button size="small" startIcon={<ClearIcon />} onClick={() => setFilters({ category: '', status: '', project: '', dateFrom: '', dateTo: '' })}>Clear</Button>}
        </Stack>
      </Stack>

      {hasActiveFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <TextField select label="Category" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {categoryOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DataTable
              columns={columns}
              data={filtered}
              emptyTitle="No expenses found"
              enableExport
              enableColumnVisibility
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
                <Typography variant="h4" fontWeight={700}>${totalExpenses.toFixed(2)}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Category Summary</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categorySummary} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {categorySummary.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setFormOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Date" type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} fullWidth />
            <TextField select label="Category" value={formData.category} onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))} fullWidth>
              {EXPENSE_CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
            <TextField label="Amount ($)" type="number" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} fullWidth />
            <TextField select label="Project" value={formData.project} onChange={(e) => setFormData((f) => ({ ...f, project: e.target.value }))} fullWidth>
              <MenuItem value="">Select Project</MenuItem>
              {MOCK_PROJECTS.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={!formData.description || !formData.amount}>Add Expense</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteConfirm?.description}"?`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
