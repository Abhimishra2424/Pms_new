import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, alpha, useTheme, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Legend, Area, AreaChart,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { CHART_COLORS } from '../../constants/config';

const REPORT_DATA = {
  employee: {
    title: 'Employee Report',
    charts: [
      {
        type: 'radar', title: 'Performance Metrics', data: [
          { metric: 'Productivity', Alice: 85, Bob: 70, Carol: 90, fullMark: 100 },
          { metric: 'Quality', Alice: 90, Bob: 75, Carol: 85, fullMark: 100 },
          { metric: 'Timeliness', Alice: 80, Bob: 85, Carol: 75, fullMark: 100 },
          { metric: 'Communication', Alice: 75, Bob: 80, Carol: 95, fullMark: 100 },
          { metric: 'Teamwork', Alice: 88, Bob: 78, Carol: 92, fullMark: 100 },
        ],
      },
      {
        type: 'pie', title: 'Task Distribution', data: [
          { name: 'Completed', value: 145 }, { name: 'In Progress', value: 32 },
          { name: 'In Review', value: 18 }, { name: 'Backlog', value: 25 },
        ],
      },
      {
        type: 'bar', title: 'Attendance', data: [
          { month: 'Jan', present: 22, absent: 1, late: 2 },
          { month: 'Feb', present: 20, absent: 2, late: 1 },
          { month: 'Mar', present: 23, absent: 0, late: 1 },
          { month: 'Apr', present: 21, absent: 1, late: 3 },
          { month: 'May', present: 22, absent: 1, late: 1 },
          { month: 'Jun', present: 20, absent: 2, late: 2 },
        ],
      },
    ],
    tableData: [
      { name: 'Alice Johnson', tasksCompleted: 45, tasksInProgress: 8, attendance: 98, rating: 4.8 },
      { name: 'Bob Smith', tasksCompleted: 32, tasksInProgress: 12, attendance: 95, rating: 4.2 },
      { name: 'Carol Davis', tasksCompleted: 52, tasksInProgress: 5, attendance: 99, rating: 4.9 },
    ],
  },
  project: {
    title: 'Project Report', charts: [],
    tableData: [
      { name: 'Website Redesign', status: 'In Progress', progress: 75, budget: 50000, spent: 35000 },
      { name: 'Mobile App', status: 'Planning', progress: 15, budget: 80000, spent: 5000 },
      { name: 'Backend API', status: 'Completed', progress: 100, budget: 30000, spent: 28000 },
    ],
  },
  task: {
    title: 'Task Report', charts: [],
    tableData: [
      { title: 'Dashboard UI', status: 'Done', priority: 'High', assignee: 'Alice Johnson', dueDate: '2026-07-30' },
      { title: 'API Integration', status: 'In Progress', priority: 'Medium', assignee: 'Bob Smith', dueDate: '2026-08-05' },
      { title: 'Testing', status: 'To Do', priority: 'High', assignee: 'Carol Davis', dueDate: '2026-08-10' },
    ],
  },
  sprint: {
    title: 'Sprint Report', charts: [],
    tableData: [
      { sprint: 'Sprint 10', planned: 20, completed: 18, velocity: 18, points: 45 },
      { sprint: 'Sprint 11', planned: 22, completed: 20, velocity: 20, points: 50 },
      { sprint: 'Sprint 12', planned: 18, completed: 15, velocity: 15, points: 38 },
    ],
  },
  bug: {
    title: 'Bug Report', charts: [],
    tableData: [
      { id: 'BUG-001', title: 'Login page crash', severity: 'Critical', status: 'Open', reporter: 'Alice Johnson', date: '2026-07-28' },
      { id: 'BUG-002', title: 'Broken link on dashboard', severity: 'Minor', status: 'Resolved', reporter: 'Bob Smith', date: '2026-07-25' },
      { id: 'BUG-003', title: 'Data export issue', severity: 'Major', status: 'In Progress', reporter: 'Carol Davis', date: '2026-07-20' },
    ],
  },
  timesheet: {
    title: 'Timesheet Report', charts: [],
    tableData: [
      { user: 'Alice Johnson', project: 'Website Redesign', hours: 120, billable: 110, date: 'Jul 2026' },
      { user: 'Bob Smith', project: 'Mobile App', hours: 95, billable: 85, date: 'Jul 2026' },
      { user: 'Carol Davis', project: 'Backend API', hours: 110, billable: 105, date: 'Jul 2026' },
    ],
  },
  performance: {
    title: 'Performance Report', charts: [],
    tableData: [
      { employee: 'Alice Johnson', productivity: 92, quality: 95, teamwork: 88, communication: 85, overall: 4.8 },
      { employee: 'Bob Smith', productivity: 78, quality: 82, teamwork: 75, communication: 80, overall: 4.1 },
      { employee: 'Carol Davis', productivity: 95, quality: 90, teamwork: 94, communication: 92, overall: 4.9 },
    ],
  },
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#a855f7'];

export default function ReportDetailPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const reportInfo = REPORT_DATA[type] || REPORT_DATA.employee;
  const data = reportInfo.charts || [];

  const renderChart = (chart) => {
    switch (chart.type) {
      case 'bar':
        const barKeys = Object.keys(chart.data[0] || {}).filter((k) => k !== 'month' && k !== 'name');
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
              <XAxis dataKey={(d) => d.month || d.name} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              {barKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chart.data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {chart.data.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
              <XAxis dataKey={(d) => d.name || d.month || d.date} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              {Object.keys(chart.data[0] || {}).filter((k) => k !== 'name' && k !== 'month' && k !== 'date').map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'radar':
        const radarKeys = Object.keys(chart.data[0] || {}).filter((k) => k !== 'metric' && k !== 'fullMark');
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={chart.data}>
              <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              {radarKeys.map((key, idx) => (
                <Radar key={key} name={key} dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.15} />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
              <XAxis dataKey={(d) => d.name || d.month || d.date} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Area type="monotone" dataKey={Object.keys(chart.data[0] || {}).filter((k) => k !== 'name' && k !== 'month' && k !== 'date')[0]} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <Typography color="text.secondary">Chart preview not available</Typography>;
    }
  };

  const tableColumns = reportInfo.tableData && reportInfo.tableData.length > 0
    ? Object.keys(reportInfo.tableData[0]).map((key) => ({ id: key, label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) }))
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title={reportInfo.title}
        breadcrumbs={[{ label: 'Reports', href: '/reports' }, { label: reportInfo.title }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />}>PDF</Button>
            <Button variant="outlined" startIcon={<TableChartIcon />}>Excel</Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>CSV</Button>
          </Stack>
        }
      />

      {data.length > 0 && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {data.map((chart, idx) => (
            <Grid item xs={12} md={chart.type === 'radar' ? 12 : 6} key={idx}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{chart.title}</Typography>
                  {renderChart(chart)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {reportInfo.tableData && reportInfo.tableData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Data</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {tableColumns.map((col) => (
                      <TableCell key={col.id} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportInfo.tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                    <TableRow key={idx}>
                      {tableColumns.map((col) => (
                        <TableCell key={col.id}>{row[col.id]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={reportInfo.tableData.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
