import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, alpha, useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskIcon from '@mui/icons-material/Task';
import SpeedIcon from '@mui/icons-material/Speed';
import BugReportIcon from '@mui/icons-material/BugReport';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';

const REPORT_TYPES = [
  { type: 'employee', title: 'Employee Report', description: 'Performance, attendance, and task completion metrics', icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
  { type: 'project', title: 'Project Report', description: 'Project status, progress, budget, and timeline', icon: <FolderOpenIcon />, gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)' },
  { type: 'task', title: 'Task Report', description: 'Task distribution, priority analysis, and completion rates', icon: <TaskIcon />, gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { type: 'sprint', title: 'Sprint Report', description: 'Sprint burndown, velocity, and completion metrics', icon: <SpeedIcon />, gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { type: 'bug', title: 'Bug Report', description: 'Bug severity, trends, and resolution times', icon: <BugReportIcon />, gradient: 'linear-gradient(135deg, #ef4444, #f97316)' },
  { type: 'timesheet', title: 'Timesheet Report', description: 'Hours logged by project, user, and category', icon: <AccessTimeIcon />, gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { type: 'performance', title: 'Performance Report', description: 'Individual performance metrics and comparisons', icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #22c55e, #a855f7)' },
];

const PROJECT_OPTIONS = ['Website Redesign', 'Mobile App', 'Backend API', 'Design System'];
const EMPLOYEE_OPTIONS = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'];

export default function ReportsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', project: '', employee: '' });

  const handleGenerate = () => {
    toast.success('Report generated');
    setFilterOpen(false);
    navigate(`/reports/${selectedType}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Reports"
        subtitle="Analytics and reports"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <Grid container spacing={2.5}>
        {REPORT_TYPES.map((report) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={report.type}>
            <motion.div variants={childVariants}>
              <Card
                sx={{
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  transition: 'all 0.25s',
                }}
                onClick={() => {
                  setSelectedType(report.type);
                  setFilterOpen(true);
                }}
              >
                <Box
                  sx={{
                    height: 100, background: report.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 48,
                  }}
                >
                  {report.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Filters</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField label="From" type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="To" type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField select label="Project" value={filters.project} onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))} fullWidth>
              <MenuItem value="">All Projects</MenuItem>
              {PROJECT_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <TextField select label="Employee" value={filters.employee} onChange={(e) => setFilters((f) => ({ ...f, employee: e.target.value }))} fullWidth>
              <MenuItem value="">All Employees</MenuItem>
              {EMPLOYEE_OPTIONS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate}>Generate Report</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
