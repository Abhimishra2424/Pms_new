import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, IconButton, Tooltip,
  Tabs, Tab, Switch, FormControlLabel, TextField, MenuItem, alpha, useTheme, LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { formatRelativeTime, formatBytes } from '../../utils/helpers';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

const MOCK_COMPANIES = [
  { id: 1, name: 'Acme Corp', usersCount: 25, projectsCount: 8, status: 'active', createdAt: '2026-01-15' },
  { id: 2, name: 'Globex Inc', usersCount: 45, projectsCount: 12, status: 'active', createdAt: '2026-02-01' },
  { id: 3, name: 'Initech LLC', usersCount: 12, projectsCount: 3, status: 'suspended', createdAt: '2026-03-10' },
  { id: 4, name: 'Hooli Technologies', usersCount: 60, projectsCount: 20, status: 'active', createdAt: '2026-01-20' },
  { id: 5, name: 'Stark Industries', usersCount: 80, projectsCount: 25, status: 'active', createdAt: '2025-11-01' },
];

const MOCK_AUDIT_LOG = [
  { id: 1, action: 'User created', user: 'Admin', company: 'Acme Corp', timestamp: '2026-07-28T14:30:00', details: 'Created user Alice Johnson' },
  { id: 2, action: 'Project deleted', user: 'Admin', company: 'Globex Inc', timestamp: '2026-07-28T13:00:00', details: 'Deleted project "Old App"' },
  { id: 3, action: 'Company suspended', user: 'Super Admin', company: 'Initech LLC', timestamp: '2026-07-27T16:00:00', details: 'Suspended for non-payment' },
  { id: 4, action: 'Settings updated', user: 'Admin', company: 'Acme Corp', timestamp: '2026-07-27T10:00:00', details: 'Updated SMTP settings' },
  { id: 5, action: 'User role changed', user: 'Admin', company: 'Hooli Technologies', timestamp: '2026-07-26T15:00:00', details: 'Promoted Bob to Project Manager' },
];

export default function AdminPage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [systemSettings, setSystemSettings] = useState({ allowRegistration: true, defaultRole: 'employee', maxUsersPerCompany: 100 });

  const stats = useMemo(() => ({
    totalCompanies: 5,
    totalUsers: 222,
    activeUsers: 198,
    storageUsed: 4587520000,
    apiStatus: 'healthy',
    dbStatus: 'healthy',
    lastCronRun: '2026-07-28T15:00:00',
    memoryUsage: 65,
  }), []);

  const companyColumns = useMemo(() => [
    { accessorKey: 'name', header: 'Company' },
    { accessorKey: 'usersCount', header: 'Users', size: 80 },
    { accessorKey: 'projectsCount', header: 'Projects', size: 80 },
    { id: 'status', header: 'Status', size: 100, cell: ({ row }) => (
      <Chip label={row.original.status} size="small" color={row.original.status === 'active' ? 'success' : 'warning'} variant="outlined" />
    )},
    { id: 'createdAt', header: 'Created', size: 110, cell: ({ row }) => formatRelativeTime(row.original.createdAt) },
    {
      id: 'actions', header: 'Actions', size: 100,
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={row.original.status === 'active' ? 'Suspend' : 'Activate'}>
            <IconButton size="small" color={row.original.status === 'active' ? 'warning' : 'success'}>
              {row.original.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], []);

  const auditColumns = useMemo(() => [
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'user', header: 'User', size: 120 },
    { accessorKey: 'company', header: 'Company', size: 130 },
    { accessorKey: 'details', header: 'Details' },
    { id: 'timestamp', header: 'Time', size: 150, cell: ({ row }) => formatRelativeTime(row.original.timestamp) },
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
        title="Admin Panel"
        subtitle="System administration"
        breadcrumbs={[{ label: 'Admin' }]}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Companies', value: stats.totalCompanies, icon: <BusinessIcon />, color: '#3b82f6' },
          { label: 'Total Users', value: stats.totalUsers, icon: <PeopleIcon />, color: '#22c55e' },
          { label: 'Active Users', value: stats.activeUsers, icon: <PeopleIcon />, color: '#06b6d4' },
          { label: 'Storage Used', value: formatBytes(stats.storageUsed), icon: <StorageIcon />, color: '#a855f7' },
        ].map((stat) => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <motion.div variants={childVariants}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ color: stat.color, mb: 0.5, fontSize: 32 }}>{stat.icon}</Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>System Health</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: stats.apiStatus === 'healthy' ? '#22c55e' : '#ef4444' }}>
                  {stats.apiStatus === 'healthy' ? <CheckCircleIcon /> : <ErrorIcon />}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">API</Typography>
                  <Typography variant="body2" fontWeight={600} textTransform="capitalize">{stats.apiStatus}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: stats.dbStatus === 'healthy' ? '#22c55e' : '#ef4444' }}>
                  {stats.dbStatus === 'healthy' ? <CheckCircleIcon /> : <ErrorIcon />}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Database</Typography>
                  <Typography variant="body2" fontWeight={600} textTransform="capitalize">{stats.dbStatus}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: 'text.disabled' }}><HistoryIcon /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Cron</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatRelativeTime(stats.lastCronRun)}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Memory Usage</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinearProgress variant="determinate" value={stats.memoryUsage} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" fontWeight={600}>{stats.memoryUsage}%</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '0 !important' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab icon={<BusinessIcon />} label="Companies" iconPosition="start" />
            <Tab icon={<HistoryIcon />} label="Audit Log" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="System Settings" iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tabValue} index={0}>
        <DataTable
          columns={companyColumns}
          data={MOCK_COMPANIES}
          emptyTitle="No companies"
          enableExport
          enableColumnVisibility
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DataTable
          columns={auditColumns}
          data={MOCK_AUDIT_LOG}
          emptyTitle="No audit logs"
          enableExport={false}
          enableColumnVisibility={false}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>System Configuration</Typography>
            <Stack spacing={2.5} maxWidth={400}>
              <FormControlLabel control={<Switch checked={systemSettings.allowRegistration} onChange={(e) => setSystemSettings({ ...systemSettings, allowRegistration: e.target.checked })} />} label="Allow Registration" />
              <TextField select label="Default Role" value={systemSettings.defaultRole} onChange={(e) => setSystemSettings({ ...systemSettings, defaultRole: e.target.value })} fullWidth>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="designer">Designer</MenuItem>
              </TextField>
              <TextField label="Max Users per Company" type="number" value={systemSettings.maxUsersPerCompany} onChange={(e) => setSystemSettings({ ...systemSettings, maxUsersPerCompany: Number(e.target.value) })} fullWidth />
              <Box>
                <Button variant="contained">Save Settings</Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>
    </motion.div>
  );
}
