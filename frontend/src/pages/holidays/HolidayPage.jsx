import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';

const HOLIDAY_TYPES = [
  { value: 'public', label: 'Public', color: '#3b82f6' },
  { value: 'company', label: 'Company', color: '#22c55e' },
  { value: 'optional', label: 'Optional', color: '#a855f7' },
];

const MOCK_HOLIDAYS = [
  { id: 1, name: 'New Year', date: '2026-01-01', type: 'public', description: 'New Year Day' },
  { id: 2, name: 'Republic Day', date: '2026-01-26', type: 'public', description: 'Republic Day of India' },
  { id: 3, name: 'Holi', date: '2026-03-14', type: 'public', description: 'Festival of Colors' },
  { id: 4, name: 'Good Friday', date: '2026-04-03', type: 'public', description: '' },
  { id: 5, name: 'Company Foundation Day', date: '2026-05-01', type: 'company', description: 'Company anniversary' },
  { id: 6, name: 'Independence Day', date: '2026-08-15', type: 'public', description: '' },
  { id: 7, name: 'Diwali', date: '2026-11-01', type: 'public', description: 'Festival of Lights' },
  { id: 8, name: 'Christmas', date: '2026-12-25', type: 'public', description: '' },
  { id: 9, name: 'Team Offsite', date: '2026-09-15', type: 'company', description: 'Annual team building' },
  { id: 10, name: 'Optional Holiday', date: '2026-10-02', type: 'optional', description: 'Gandhi Jayanti' },
];

export default function HolidayPage() {
  const theme = useTheme();
  const [year, setYear] = useState(dayjs().year());
  const [formOpen, setFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'public', description: '' });

  const filtered = useMemo(() => MOCK_HOLIDAYS.filter((h) => dayjs(h.date).year() === year), [year]);

  const yearOptions = useMemo(() => {
    const y = dayjs().year();
    return [y - 1, y, y + 1, y + 2];
  }, []);

  const handleSave = () => {
    toast.success(editingHoliday ? 'Holiday updated' : 'Holiday added');
    setFormOpen(false);
    setEditingHoliday(null);
    setFormData({ name: '', date: '', type: 'public', description: '' });
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({ name: holiday.name, date: holiday.date, type: holiday.type, description: holiday.description });
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    toast.success('Holiday deleted');
  };

  const getDayOfWeek = (date) => dayjs(date).format('dddd');

  const typeColors = { public: '#3b82f6', company: '#22c55e', optional: '#a855f7' };

  const columns = useMemo(() => [
    { id: 'date', header: 'Date', size: 130, cell: ({ row }) => <Typography fontWeight={600}>{formatDate(row.original.date)}</Typography> },
    { accessorKey: 'day', header: 'Day', size: 110, cell: ({ row }) => getDayOfWeek(row.original.date) },
    { accessorKey: 'name', header: 'Holiday Name', cell: ({ row }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <CelebrationIcon sx={{ color: typeColors[row.original.type], fontSize: 18 }} />
        <Typography>{row.original.name}</Typography>
      </Stack>
    )},
    {
      id: 'type', header: 'Type', size: 110,
      cell: ({ row }) => {
        const t = HOLIDAY_TYPES.find((ht) => ht.value === row.original.type);
        return <Chip label={t?.label || row.original.type} size="small" sx={{ bgcolor: alpha(t?.color || '#64748b', 0.15), color: t?.color || '#64748b', fontWeight: 600 }} />;
      },
    },
    {
      id: 'actions', header: 'Actions', size: 100,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.original.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], []);

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Holidays"
        subtitle="View and manage company holidays"
        breadcrumbs={[{ label: 'Holidays' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <TextField select value={year} onChange={(e) => setYear(Number(e.target.value))} size="small" sx={{ minWidth: 100 }}>
              {yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingHoliday(null); setFormData({ name: '', date: '', type: 'public', description: '' }); setFormOpen(true); }}>
              Add Holiday
            </Button>
          </Stack>
        }
      />

      <motion.div variants={childVariants}>
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No holidays for this year"
          enableExport
          enableColumnVisibility
        />
      </motion.div>

      <Dialog open={formOpen} onClose={() => { setFormOpen(false); setEditingHoliday(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Holiday Name" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} fullWidth />
            <TextField label="Date" type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField select label="Type" value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))} fullWidth>
              {HOLIDAY_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField label="Description (optional)" multiline rows={3} value={formData.description} onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormOpen(false); setEditingHoliday(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name || !formData.date}>
            {editingHoliday ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
