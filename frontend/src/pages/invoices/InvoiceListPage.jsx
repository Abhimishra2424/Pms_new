import React, { useState, useMemo } from 'react';
import {
  Box, Stack, Button, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Fab, alpha, useTheme, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { INVOICE_STATUS } from '../../constants/status';
import { formatDate, formatDateTime } from '../../utils/helpers';

const MOCK_CLIENTS = ['Acme Corp', 'Globex Inc', 'Initech', 'Hooli', 'Stark Industries'];

const MOCK_INVOICES = [
  { id: 'INV-001', client: 'Acme Corp', issueDate: '2026-07-01', dueDate: '2026-07-30', status: 'paid', amount: 15000, balance: 0 },
  { id: 'INV-002', client: 'Globex Inc', issueDate: '2026-07-15', dueDate: '2026-08-14', status: 'sent', amount: 8500, balance: 8500 },
  { id: 'INV-003', client: 'Acme Corp', issueDate: '2026-06-01', dueDate: '2026-06-30', status: 'overdue', amount: 12000, balance: 12000 },
  { id: 'INV-004', client: 'Hooli', issueDate: '2026-07-20', dueDate: '2026-08-19', status: 'draft', amount: 22000, balance: 22000 },
  { id: 'INV-005', client: 'Stark Industries', issueDate: '2026-07-10', dueDate: '2026-08-09', status: 'partially_paid', amount: 30000, balance: 10000 },
  { id: 'INV-006', client: 'Globex Inc', issueDate: '2026-05-01', dueDate: '2026-05-31', status: 'paid', amount: 5000, balance: 0 },
  { id: 'INV-007', client: 'Initech', issueDate: '2026-07-25', dueDate: '2026-08-24', status: 'draft', amount: 7500, balance: 7500 },
  { id: 'INV-008', client: 'Stark Industries', issueDate: '2026-06-15', dueDate: '2026-07-15', status: 'overdue', amount: 18000, balance: 18000 },
];

export default function InvoiceListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ client: '', issueDate: '', dueDate: '', items: [{ description: '', qty: 1, unitPrice: 0 }], taxRate: 10, discount: 0, notes: '' });
  const [filters, setFilters] = useState({ status: '', client: '', dateFrom: '', dateTo: '' });

  const statusOptions = Object.values(INVOICE_STATUS).map((s) => ({ value: s.value, label: s.label }));
  const clientOptions = MOCK_CLIENTS.map((c) => ({ value: c, label: c }));

  const filtered = useMemo(() => {
    let list = MOCK_INVOICES;
    if (search) list = list.filter((inv) => inv.id.toLowerCase().includes(search.toLowerCase()) || inv.client.toLowerCase().includes(search.toLowerCase()));
    if (filters.status) list = list.filter((inv) => inv.status === filters.status);
    if (filters.client) list = list.filter((inv) => inv.client === filters.client);
    if (filters.dateFrom) list = list.filter((inv) => inv.issueDate >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((inv) => inv.issueDate <= filters.dateTo);
    return list;
  }, [search, filters]);

  const totals = useMemo(() => ({
    total: filtered.reduce((sum, inv) => sum + inv.amount, 0),
    balance: filtered.reduce((sum, inv) => sum + inv.balance, 0),
    paid: filtered.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: filtered.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance, 0),
  }), [filtered]);

  const handleCreate = () => {
    toast.success('Invoice created successfully');
    setFormOpen(false);
  };

  const handleSend = (id) => { toast.success(`Invoice ${id} sent`); };
  const handleMarkPaid = (id) => { toast.success(`Invoice ${id} marked as paid`); };
  const handleDelete = () => { toast.success('Invoice deleted'); setDeleteConfirm(null); };

  const hasActiveFilters = filters.status || filters.client || filters.dateFrom || filters.dateTo;

  const addItem = () => setFormData((f) => ({ ...f, items: [...f.items, { description: '', qty: 1, unitPrice: 0 }] }));
  const removeItem = (idx) => setFormData((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => setFormData((f) => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const subtotal = formData.items.reduce((s, item) => s + item.qty * item.unitPrice, 0);
  const taxAmount = subtotal * (formData.taxRate / 100);
  const total = subtotal + taxAmount - formData.discount;

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'Invoice #', size: 110, cell: ({ row }) => <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{row.original.id}</Typography> },
    { accessorKey: 'client', header: 'Client', size: 150 },
    { id: 'issueDate', header: 'Issue Date', size: 120, cell: ({ row }) => formatDate(row.original.issueDate) },
    { id: 'dueDate', header: 'Due Date', size: 120, cell: ({ row }) => {
      const isOverdue = dayjs(row.original.dueDate).isBefore(dayjs()) && row.original.status !== 'paid';
      return <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'} fontWeight={isOverdue ? 600 : 400}>{formatDate(row.original.dueDate)}</Typography>;
    }},
    { id: 'status', header: 'Status', size: 120, cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={INVOICE_STATUS} /> },
    { id: 'amount', header: 'Amount', size: 120, cell: ({ row }) => <Typography variant="body2" fontWeight={600}>${row.original.amount.toLocaleString()}</Typography> },
    { id: 'balance', header: 'Balance', size: 100, cell: ({ row }) => <Typography variant="body2" color={row.original.balance > 0 ? 'error' : 'success.main'} fontWeight={600}>${row.original.balance.toLocaleString()}</Typography> },
    {
      id: 'actions', header: 'Actions', size: 150,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.original.id}`); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {row.original.status === 'draft' && <Tooltip title="Send"><IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleSend(row.original.id); }}><SendIcon fontSize="small" /></IconButton></Tooltip>}
          {(row.original.status === 'sent' || row.original.status === 'overdue' || row.original.status === 'partially_paid') && (
            <Tooltip title="Mark Paid"><IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleMarkPaid(row.original.id); }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
          )}
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [navigate]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Invoices"
        subtitle="Manage invoices and payments"
        breadcrumbs={[{ label: 'Invoices' }]}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice # or client..." />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant={hasActiveFilters ? 'contained' : 'outlined'} startIcon={<FilterListIcon />} onClick={() => {}} color={hasActiveFilters ? 'primary' : 'inherit'}>
            Filters {hasActiveFilters ? '(active)' : ''}
          </Button>
          {hasActiveFilters && <Button size="small" startIcon={<ClearIcon />} onClick={() => setFilters({ status: '', client: '', dateFrom: '', dateTo: '' })}>Clear</Button>}
        </Stack>
      </Stack>

      {hasActiveFilters && (
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} size="small" sx={{ minWidth: 140 }}>
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField select label="Client" value={filters.client} onChange={(e) => setFilters((f) => ({ ...f, client: e.target.value }))} size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            {clientOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField label="From" type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <TextField label="To" type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        </Stack>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        emptyTitle="No invoices found"
        enableExport
        enableColumnVisibility
      />

      <Card sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="flex-end">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total Amount</Typography>
            <Typography variant="h6" fontWeight={700}>${totals.total.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total Collected</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">${totals.paid.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Outstanding</Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">${totals.balance.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Overdue</Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">${totals.overdue.toLocaleString()}</Typography>
          </Box>
        </Stack>
      </Card>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setFormOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField select label="Client" value={formData.client} onChange={(e) => setFormData((f) => ({ ...f, client: e.target.value }))} fullWidth>
              <MenuItem value="">Select Client</MenuItem>
              {MOCK_CLIENTS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Issue Date" type="date" value={formData.issueDate} onChange={(e) => setFormData((f) => ({ ...f, issueDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Typography variant="subtitle2" fontWeight={600}>Invoice Items</Typography>
            {formData.items.map((item, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField label="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} size="small" sx={{ flex: 2 }} />
                <TextField label="Qty" type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))} size="small" sx={{ flex: 0.5, minWidth: 70 }} />
                <TextField label="Unit Price" type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} size="small" sx={{ flex: 0.8, minWidth: 100 }} />
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>${(item.qty * item.unitPrice).toFixed(2)}</Typography>
                <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={formData.items.length === 1}><ClearIcon fontSize="small" /></IconButton>
              </Stack>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
            <Stack direction="row" spacing={2}>
              <TextField label="Tax Rate (%)" type="number" value={formData.taxRate} onChange={(e) => setFormData((f) => ({ ...f, taxRate: Number(e.target.value) }))} size="small" sx={{ minWidth: 140 }} />
              <TextField label="Discount ($)" type="number" value={formData.discount} onChange={(e) => setFormData((f) => ({ ...f, discount: Number(e.target.value) }))} size="small" sx={{ minWidth: 140 }} />
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">Subtotal: <strong>${subtotal.toFixed(2)}</strong></Typography>
              <Typography variant="body2">Tax ({formData.taxRate}%): <strong>${taxAmount.toFixed(2)}</strong></Typography>
              <Typography variant="body2">Discount: <strong>-${formData.discount.toFixed(2)}</strong></Typography>
              <Typography variant="h6" fontWeight={700}>Total: ${total.toFixed(2)}</Typography>
            </Box>
            <TextField label="Notes (optional)" multiline rows={2} value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={!formData.client}>Create Invoice</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${deleteConfirm?.id}"?`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
