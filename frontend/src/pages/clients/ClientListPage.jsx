import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stack, Button, Avatar, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Fab, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

const MOCK_CLIENTS = [
  { id: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0100', company: 'Acme Corporation', website: 'https://acme.com', address: '123 Main St, NYC', status: 'active', projectsCount: 3, avatar: '' },
  { id: 2, name: 'Globex Inc', email: 'info@globex.com', phone: '+1-555-0101', company: 'Globex Inc', website: 'https://globex.com', address: '456 Oak Ave, SF', status: 'active', projectsCount: 5, avatar: '' },
  { id: 3, name: 'Initech', email: 'support@initech.com', phone: '+1-555-0102', company: 'Initech LLC', website: 'https://initech.com', address: '789 Pine Rd, CHI', status: 'inactive', projectsCount: 0, avatar: '' },
  { id: 4, name: 'Hooli', email: 'hello@hooli.com', phone: '+1-555-0103', company: 'Hooli Technologies', website: 'https://hooli.com', address: '321 Elm St, PA', status: 'active', projectsCount: 2, avatar: '' },
  { id: 5, name: 'Stark Industries', email: 'ceo@stark.com', phone: '+1-555-0104', company: 'Stark Industries', website: 'https://stark.com', address: '1 Avengers Tower, NYC', status: 'active', projectsCount: 7, avatar: '' },
];

export default function ClientListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', website: '', address: '', status: 'active' });

  const filtered = useMemo(() => {
    if (!search) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSave = () => {
    toast.success(editingClient ? 'Client updated' : 'Client created');
    setFormOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', company: '', website: '', address: '', status: 'active' });
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email, phone: client.phone, company: client.company, website: client.website, address: client.address, status: client.status });
    setFormOpen(true);
  };

  const handleDelete = () => {
    toast.success('Client deleted');
    setDeleteConfirm(null);
  };

  const columns = useMemo(() => [
    {
      id: 'name', header: 'Client',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={c.avatar} sx={{ width: 36, height: 36, bgcolor: generateAvatarColor(c.name), fontSize: 14 }}>
              {getInitials(c.name)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
              <Typography variant="caption" color="text.secondary">{c.company}</Typography>
            </Box>
          </Stack>
        );
      },
    },
    { accessorKey: 'email', header: 'Email', size: 200 },
    { accessorKey: 'phone', header: 'Phone', size: 140 },
    { accessorKey: 'company', header: 'Company', size: 160 },
    { id: 'projects', header: 'Projects', size: 90, cell: ({ row }) => <Chip label={row.original.projectsCount} size="small" variant="outlined" /> },
    { id: 'status', header: 'Status', size: 100, cell: ({ row }) => (
      <Chip label={row.original.status} size="small" color={row.original.status === 'active' ? 'success' : 'default'} variant="outlined" />
    )},
    {
      id: 'actions', header: 'Actions', size: 120,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/clients/${row.original.id}`); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row.original); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [navigate]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Clients"
        subtitle="Manage your clients"
        breadcrumbs={[{ label: 'Clients' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', company: '', website: '', address: '', status: 'active' }); setFormOpen(true); }}>
            Add Client
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or company..." />
        </Box>
      </Stack>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/clients/${row.id}`)}
        emptyTitle="No clients found"
        enableExport
        enableColumnVisibility
      />

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', company: '', website: '', address: '', status: 'active' }); setFormOpen(true); }}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => { setFormOpen(false); setEditingClient(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Name" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))} fullWidth />
              <TextField label="Company" value={formData.company} onChange={(e) => setFormData((f) => ({ ...f, company: e.target.value }))} fullWidth />
            </Stack>
            <TextField label="Website" value={formData.website} onChange={(e) => setFormData((f) => ({ ...f, website: e.target.value }))} fullWidth />
            <TextField label="Address" multiline rows={2} value={formData.address} onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormOpen(false); setEditingClient(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name}>{editingClient ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}
