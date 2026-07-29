import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Tabs, Tab, IconButton, Tooltip,
  LinearProgress, Avatar, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import TodayIcon from '@mui/icons-material/Today';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { LEAVE_STATUS } from '../../constants/status';
import { formatDate, formatRelativeTime } from '../../utils/helpers';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

export default function LeavePage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [formData, setFormData] = useState({
    type: 'annual', startDate: '', endDate: '', reason: '', attachments: [],
  });

  const balances = useMemo(() => [
    { type: 'Annual', used: 15, total: 20, color: '#3b82f6' },
    { type: 'Sick', used: 3, total: 10, color: '#22c55e' },
    { type: 'Personal', used: 2, total: 5, color: '#f97316' },
    { type: 'Maternity', used: 0, total: 90, color: '#a855f7' },
    { type: 'Unpaid', used: 0, total: 15, color: '#64748b' },
  ], []);

  const myLeaves = useMemo(() => [
    { id: 'LV001', type: 'Annual', startDate: '2026-08-10', endDate: '2026-08-14', reason: 'Family vacation', status: 'approved', appliedOn: '2026-07-28' },
    { id: 'LV002', type: 'Sick', startDate: '2026-07-15', endDate: '2026-07-15', reason: 'Not feeling well', status: 'pending', appliedOn: '2026-07-14' },
    { id: 'LV003', type: 'Personal', startDate: '2026-06-20', endDate: '2026-06-20', reason: 'Personal errand', status: 'rejected', appliedOn: '2026-06-18' },
    { id: 'LV004', type: 'Annual', startDate: '2026-05-05', endDate: '2026-05-09', reason: 'Travel', status: 'approved', appliedOn: '2026-04-28' },
    { id: 'LV005', type: 'Sick', startDate: '2026-04-10', endDate: '2026-04-11', reason: 'Medical appointment', status: 'cancelled', appliedOn: '2026-04-09' },
  ], []);

  const teamLeaves = useMemo(() => [
    { id: 'LV006', employee: 'Alice Johnson', type: 'Annual', startDate: '2026-08-05', endDate: '2026-08-07', reason: 'Personal trip', status: 'pending', appliedOn: '2026-07-30' },
    { id: 'LV007', employee: 'Bob Smith', type: 'Sick', startDate: '2026-08-01', endDate: '2026-08-02', reason: 'Flu', status: 'pending', appliedOn: '2026-07-31' },
    { id: 'LV008', employee: 'Carol Davis', type: 'Personal', startDate: '2026-08-10', endDate: '2026-08-10', reason: 'Family event', status: 'pending', appliedOn: '2026-08-01' },
  ], []);

  const handleApply = () => {
    toast.success('Leave application submitted successfully');
    setFormOpen(false);
    setFormData({ type: 'annual', startDate: '', endDate: '', reason: '', attachments: [] });
  };

  const handleApproveReject = (status) => {
    toast.success(`Leave ${status} successfully`);
    setApprovalOpen(null);
    setApprovalReason('');
  };

  const handleCancel = (id) => {
    toast.success('Leave cancelled');
  };

  const myColumns = useMemo(() => [
    { accessorKey: 'id', header: 'Leave ID', size: 100 },
    { accessorKey: 'type', header: 'Type', size: 100, cell: ({ row }) => <Chip label={row.original.type} size="small" variant="outlined" color="primary" /> },
    { id: 'dates', header: 'Dates', size: 160, cell: ({ row }) => `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}` },
    { accessorKey: 'reason', header: 'Reason', size: 180 },
    { id: 'status', header: 'Status', size: 110, cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={LEAVE_STATUS} /> },
    { accessorKey: 'appliedOn', header: 'Applied', size: 110, cell: ({ row }) => formatDate(row.original.appliedOn) },
    {
      id: 'actions', header: 'Actions', size: 100,
      cell: ({ row }) => row.original.status === 'pending' ? (
        <Tooltip title="Cancel">
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleCancel(row.original.id); }}>
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null,
    },
  ], []);

  const teamColumns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 80 },
    { accessorKey: 'employee', header: 'Employee', size: 140 },
    { accessorKey: 'type', header: 'Type', size: 100, cell: ({ row }) => <Chip label={row.original.type} size="small" variant="outlined" color="primary" /> },
    { id: 'dates', header: 'Dates', size: 160, cell: ({ row }) => `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}` },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'appliedOn', header: 'Applied', size: 110, cell: ({ row }) => formatDate(row.original.appliedOn) },
    {
      id: 'actions', header: 'Actions', size: 140,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); setApprovalOpen(row.original); }}>
            Approve
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); setApprovalOpen(row.original); }}>
            Reject
          </Button>
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
        title="Leaves"
        subtitle="Manage leave requests and balances"
        breadcrumbs={[{ label: 'Leaves' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Apply Leave
          </Button>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {balances.map((bal) => (
          <Grid item xs={6} sm={4} md={2.4} key={bal.type}>
            <motion.div variants={childVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h4" fontWeight={700} color={bal.color}>{bal.used}</Typography>
                  <Typography variant="body2" color="text.secondary">/ {bal.total} {bal.type}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(bal.used / bal.total) * 100}
                    sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: alpha(bal.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: bal.color } }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div variants={childVariants}>
        <Card>
          <CardContent sx={{ pb: '0 !important' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab icon={<EventNoteIcon />} label="My Leaves" iconPosition="start" />
              <Tab icon={<PeopleIcon />} label="Team Leaves" iconPosition="start" />
              <Tab icon={<CalendarMonthIcon />} label="Calendar" iconPosition="start" />
            </Tabs>
          </CardContent>
        </Card>

        <TabPanel value={tabValue} index={0}>
          <DataTable
            columns={myColumns}
            data={myLeaves}
            emptyTitle="No leave applications"
            enableExport
            enableColumnVisibility
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataTable
            columns={teamColumns}
            data={teamLeaves}
            emptyTitle="No pending leave requests"
            enableExport={false}
            enableColumnVisibility={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">Leave calendar view showing approved leaves on a monthly calendar</Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </motion.div>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField select label="Leave Type" value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))} fullWidth>
              {LEAVE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField label="Reason" multiline rows={4} value={formData.reason} onChange={(e) => setFormData((f) => ({ ...f, reason: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleApply} disabled={!formData.startDate || !formData.endDate}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(approvalOpen)} onClose={() => setApprovalOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Leave Request</DialogTitle>
        <DialogContent dividers>
          {approvalOpen && (
            <Stack spacing={2}>
              <Typography variant="body2"><strong>Employee:</strong> {approvalOpen.employee}</Typography>
              <Typography variant="body2"><strong>Type:</strong> {approvalOpen.type}</Typography>
              <Typography variant="body2"><strong>Dates:</strong> {formatDate(approvalOpen.startDate)} - {formatDate(approvalOpen.endDate)}</Typography>
              <Typography variant="body2"><strong>Reason:</strong> {approvalOpen.reason}</Typography>
              <TextField label="Reason (optional)" multiline rows={3} value={approvalReason} onChange={(e) => setApprovalReason(e.target.value)} fullWidth />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalOpen(null)}>Cancel</Button>
          <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => handleApproveReject('rejected')}>Reject</Button>
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApproveReject('approved')}>Approve</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
