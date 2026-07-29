import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FolderOpen,
  TaskAlt,
  PlayCircle,
  PendingActions,
  People,
  Group,
  MoreHoriz,
  Schedule,
  Videocam,
  Event,
  Circle as CircleIcon,
  CheckCircle,
  RadioButtonUnchecked,
  TrendingUp,
  TrendingDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PageHeader from '../../components/common/PageHeader';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import PriorityBadge from '../../components/common/PriorityBadge';
import { useThemeMode } from '../../context/ThemeContext';
import { getInitials, generateAvatarColor, formatRelativeTime } from '../../utils/helpers';
import { TASK_STATUS } from '../../constants/status';

dayjs.extend(relativeTime);

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const mockStats = {
  totalProjects: { value: 24, trend: 12 },
  totalTasks: { value: 156, trend: -5 },
  activeTasks: { value: 45, trend: 8 },
  pendingTasks: { value: 32, trend: -3 },
  totalEmployees: { value: 48, trend: 15 },
  totalTeams: { value: 6, trend: 0 },
};

const mockProjectStatus = { labels: ['Planning', 'Active', 'On Hold', 'Completed'], data: [4, 8, 3, 9] };
const mockTaskPriority = { labels: ['Low', 'Medium', 'High', 'Critical'], data: [30, 50, 40, 20] };
const mockWeeklyActivity = [
  { day: 'Mon', created: 5, completed: 3 },
  { day: 'Tue', created: 8, completed: 6 },
  { day: 'Wed', created: 3, completed: 7 },
  { day: 'Thu', created: 9, completed: 4 },
  { day: 'Fri', created: 6, completed: 8 },
  { day: 'Sat', created: 2, completed: 5 },
  { day: 'Sun', created: 1, completed: 2 },
];
const mockTeamProductivity = [
  { name: 'Alice', completed: 24 },
  { name: 'Bob', completed: 18 },
  { name: 'Charlie', completed: 30 },
  { name: 'Diana', completed: 15 },
  { name: 'Eve', completed: 22 },
  { name: 'Frank', completed: 12 },
];

const mockActivities = [
  { id: 1, user: 'Alice Johnson', action: 'created task', target: 'Design landing page', type: 'create', time: dayjs().subtract(5, 'minutes').toISOString() },
  { id: 2, user: 'Bob Smith', action: 'moved task', target: 'API integration', type: 'status', detail: 'from In Progress to Done', time: dayjs().subtract(1, 'hour').toISOString() },
  { id: 3, user: 'Charlie Brown', action: 'commented on', target: 'User authentication', type: 'comment', detail: 'We should use OAuth2 for this', time: dayjs().subtract(2, 'hours').toISOString() },
  { id: 4, user: 'Diana Prince', action: 'changed priority of', target: 'Payment gateway', type: 'priority', detail: 'from Medium to High', time: dayjs().subtract(4, 'hours').toISOString() },
  { id: 5, user: 'Eve Wilson', action: 'assigned', target: 'Database migration', type: 'assign', detail: 'to Frank', time: dayjs().subtract(6, 'hours').toISOString() },
  { id: 6, user: 'Frank Castle', action: 'completed task', target: 'Setup CI/CD pipeline', type: 'complete', time: dayjs().subtract(1, 'day').toISOString() },
];

const mockMyTasks = [
  { id: 1, title: 'Implement user dashboard', priority: 'highest', dueDate: dayjs().add(1, 'day').toISOString(), project: 'Project Alpha', status: 'in_progress', assignee: null },
  { id: 2, title: 'Fix login page responsiveness', priority: 'high', dueDate: dayjs().add(2, 'days').toISOString(), project: 'Website Redesign', status: 'todo', assignee: null },
  { id: 3, title: 'Write API documentation', priority: 'medium', dueDate: dayjs().add(5, 'days').toISOString(), project: 'API Gateway', status: 'in_progress', assignee: null },
  { id: 4, title: 'Setup monitoring alerts', priority: 'low', dueDate: dayjs().add(7, 'days').toISOString(), project: 'Infrastructure', status: 'backlog', assignee: null },
  { id: 5, title: 'Review pull requests', priority: 'medium', dueDate: dayjs().add(3, 'days').toISOString(), project: 'Project Alpha', status: 'in_review', assignee: null },
];

const mockEvents = [
  { id: 1, title: 'Sprint Planning', time: '10:00 AM', attendees: 8, today: true },
  { id: 2, title: 'Design Review', time: '2:00 PM', attendees: 5, today: true },
  { id: 3, title: 'Client Meeting', time: '11:00 AM', attendees: 4, today: false, tomorrow: true },
  { id: 4, title: 'Tech Talk: React 19', time: '3:00 PM', attendees: 15, today: false, tomorrow: true },
];

const mockNotifications = [
  { id: 1, type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned to "Database Optimization"', time: dayjs().subtract(10, 'minutes').toISOString(), read: false },
  { id: 2, type: 'mention', title: 'You were mentioned', message: 'Alice mentioned you in a comment on "API Design"', time: dayjs().subtract(30, 'minutes').toISOString(), read: false },
  { id: 3, type: 'status_change', title: 'Task Status Updated', message: '"Homepage Redesign" moved to In Review', time: dayjs().subtract(2, 'hours').toISOString(), read: false },
  { id: 4, type: 'comment', title: 'New Comment', message: 'Bob commented on "User Authentication"', time: dayjs().subtract(3, 'hours').toISOString(), read: true },
  { id: 5, type: 'deadline', title: 'Upcoming Deadline', message: '"Payment Integration" is due tomorrow', time: dayjs().subtract(5, 'hours').toISOString(), read: true },
];

const mockTeamMembers = [
  { id: 1, name: 'Alice Johnson', role: 'Frontend Lead', taskCount: 5, online: true },
  { id: 2, name: 'Bob Smith', role: 'Backend Developer', taskCount: 3, online: true },
  { id: 3, name: 'Charlie Brown', role: 'Full Stack', taskCount: 7, online: false },
  { id: 4, name: 'Diana Prince', role: 'UI/UX Designer', taskCount: 4, online: true },
  { id: 5, name: 'Eve Wilson', role: 'DevOps Engineer', taskCount: 2, online: false },
  { id: 6, name: 'Frank Castle', role: 'QA Engineer', taskCount: 6, online: true },
];

const mockSprint = {
  name: 'Sprint 12',
  totalPoints: 80,
  completedPoints: 52,
  daysRemaining: 5,
  todo: 8,
  inProgress: 12,
  done: 20,
};

const statCardsConfig = [
  { key: 'totalProjects', label: 'Total Projects', icon: FolderOpen, gradient: ['#667eea', '#764ba2'] },
  { key: 'totalTasks', label: 'Total Tasks', icon: TaskAlt, gradient: ['#f093fb', '#f5576c'] },
  { key: 'activeTasks', label: 'Active Tasks', icon: PlayCircle, gradient: ['#4facfe', '#00f2fe'] },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: PendingActions, gradient: ['#fa709a', '#fee140'] },
  { key: 'totalEmployees', label: 'Total Employees', icon: People, gradient: ['#43e97b', '#38f9d7'] },
  { key: 'totalTeams', label: 'Total Teams', icon: Group, gradient: ['#a18cd1', '#fbc2eb'] },
];

function AnimatedCount({ value }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const duration = 1200;
    const startValue = 0;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startValue + (value - startValue) * easeOut));
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    }

    countRef.current = requestAnimationFrame(animate);
    return () => {
      if (countRef.current) cancelAnimationFrame(countRef.current);
    };
  }, [value]);

  return <>{count}</>;
}

function StatCard({ config, data, loading }) {
  const theme = useTheme();
  const Icon = config.icon;
  const trend = data?.trend ?? 0;
  const isUp = trend >= 0;

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SkeletonLoader type="card" count={1} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(config.gradient[0], 0.15)}`,
          borderColor: alpha(config.gradient[0], 0.3),
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(config.gradient[0], 0.08)}, ${alpha(config.gradient[1], 0.08)})`,
          pointerEvents: 'none',
        }}
      />
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              boxShadow: `0 4px 12px ${alpha(config.gradient[0], 0.3)}`,
            }}
          >
            <Icon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {isUp ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              fontWeight={600}
              color={isUp ? 'success.main' : 'error.main'}
            >
              {isUp ? '+' : ''}{trend}%
            </Typography>
          </Stack>
        </Stack>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ mb: 0.5, fontVariantNumeric: 'tabular-nums' }}
        >
          <AnimatedCount value={data?.value ?? 0} />
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {config.label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, action, children, loading, loadingHeight = 300, empty, emptyProps, sx }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {action}
      </Box>
      {loading ? (
        <Box sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SkeletonLoader type="chart" height={loadingHeight - 80} />
        </Box>
      ) : empty ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            title={emptyProps?.title || 'No data'}
            description={emptyProps?.description}
            icon={emptyProps?.icon}
          />
        </Box>
      ) : (
        <Box sx={{ flex: 1, p: 2 }}>{children}</Box>
      )}
    </Card>
  );
}

function ChartSection({ projectStatus, taskPriority, weeklyActivity, teamProductivity, loading }) {
  const theme = useTheme();
  const { isDark } = useThemeMode();

  const chartColors = useMemo(() => ({
    text: isDark ? '#e0e0e0' : '#666',
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    projectColors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
    priorityColors: ['#8BC34A', '#FFC107', '#FF5722', '#F44336'],
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
  }), [isDark, theme]);

  const projectStatusChartData = {
    labels: projectStatus?.labels || [],
    datasets: [{
      data: projectStatus?.data || [],
      backgroundColor: chartColors.projectColors,
      borderColor: isDark ? alpha('#fff', 0.1) : '#fff',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const taskPriorityChartData = {
    labels: taskPriority?.labels || [],
    datasets: [{
      data: taskPriority?.data || [],
      backgroundColor: chartColors.priorityColors,
      borderColor: isDark ? alpha('#fff', 0.1) : '#fff',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColors.text,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#2d2d5e' : '#fff',
        titleColor: isDark ? '#fff' : '#333',
        bodyColor: isDark ? '#ccc' : '#666',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
      },
    },
    cutout: '65%',
  }), [isDark, chartColors]);

  const rechartsTheme = useMemo(() => ({
    axis: { stroke: chartColors.grid, fontSize: 11, fontFamily: 'Inter' },
    grid: { stroke: chartColors.grid },
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? '#2d2d5e' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      },
    },
  }), [isDark, chartColors]);

  const weeklyChartData = weeklyActivity?.map(d => ({
    ...d,
    fill: chartColors.primary,
  })) || [];

  const productChartData = teamProductivity?.map(d => ({
    ...d,
    fill: chartColors.secondary,
  })) || [];

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6}>
        <SectionCard title="Project Status" loading={loading} loadingHeight={320}>
          <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {projectStatus && projectStatus.data?.every(v => v === 0) ? (
              <EmptyState title="No project data" />
            ) : (
              <Doughnut data={projectStatusChartData} options={chartOptions} />
            )}
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionCard title="Task Priority" loading={loading} loadingHeight={320}>
          <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {taskPriority && taskPriority.data?.every(v => v === 0) ? (
              <EmptyState title="No task data" />
            ) : (
              <Pie data={taskPriorityChartData} options={chartOptions} />
            )}
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionCard title="Weekly Activity" loading={loading} loadingHeight={320}>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={rechartsTheme.grid.stroke} />
                <XAxis
                  dataKey="day"
                  stroke={rechartsTheme.axis.stroke}
                  tick={{ fontSize: 11, fontFamily: 'Inter', fill: rechartsTheme.axis.stroke }}
                  axisLine={{ stroke: rechartsTheme.grid.stroke }}
                />
                <YAxis
                  stroke={rechartsTheme.axis.stroke}
                  tick={{ fontSize: 11, fontFamily: 'Inter', fill: rechartsTheme.axis.stroke }}
                  axisLine={{ stroke: rechartsTheme.grid.stroke }}
                />
                <Bar
                  dataKey="created"
                  name="Created"
                  fill={chartColors.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill={chartColors.secondary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionCard title="Team Productivity" loading={loading} loadingHeight={320}>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productChartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={rechartsTheme.grid.stroke} horizontal={false} />
                <XAxis
                  type="number"
                  stroke={rechartsTheme.axis.stroke}
                  tick={{ fontSize: 11, fontFamily: 'Inter', fill: rechartsTheme.axis.stroke }}
                  axisLine={{ stroke: rechartsTheme.grid.stroke }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={rechartsTheme.axis.stroke}
                  tick={{ fontSize: 11, fontFamily: 'Inter', fill: rechartsTheme.axis.stroke }}
                  axisLine={false}
                  width={60}
                />
                <Bar
                  dataKey="completed"
                  name="Tasks Completed"
                  fill={chartColors.primary}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                  label={{
                    position: 'right',
                    fill: chartColors.text,
                    fontSize: 11,
                    fontFamily: 'Inter',
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
}

function RecentActivities({ activities, loading }) {
  const theme = useTheme();

  return (
    <SectionCard
      title="Recent Activity"
      loading={loading}
      loadingHeight={400}
      empty={!activities || activities.length === 0}
      emptyProps={{ title: 'No recent activity', description: 'Team activity will appear here' }}
      action={
        <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ textTransform: 'none', fontWeight: 500 }}>
          View all
        </Button>
      }
    >
      <List disablePadding>
        {activities?.slice(0, 5).map((activity, idx) => (
          <React.Fragment key={activity.id}>
            {idx > 0 && <Divider component="li" sx={{ opacity: 0.4 }} />}
            <ListItem disablePadding sx={{ py: 1.5, px: 0.5 }}>
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    bgcolor: generateAvatarColor(activity.user),
                  }}
                >
                  {getInitials(activity.user)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    <Typography component="span" fontWeight={600} variant="body2">
                      {activity.user}
                    </Typography>{' '}
                    {activity.action}{' '}
                    <Typography component="span" fontWeight={500} variant="body2" color="text.primary">
                      {activity.target}
                    </Typography>
                    {activity.detail && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}{activity.detail}
                      </Typography>
                    )}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {formatRelativeTime(activity.time)}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </SectionCard>
  );
}

function MyTasks({ tasks, loading }) {
  const theme = useTheme();
  const [checked, setChecked] = useState([]);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    const priorityOrder = { highest: 0, high: 1, medium: 2, low: 3, lowest: 4 };
    return [...tasks].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks]);

  const handleToggle = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <SectionCard
      title="My Tasks"
      loading={loading}
      loadingHeight={400}
      empty={!tasks || tasks.length === 0}
      emptyProps={{ title: 'No tasks', description: 'Tasks assigned to you will appear here' }}
      action={
        <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ textTransform: 'none', fontWeight: 500 }}>
          View all
        </Button>
      }
    >
      <List disablePadding>
        {sortedTasks?.map((task, idx) => {
          const isChecked = checked.includes(task.id);
          const dueFromNow = dayjs(task.dueDate).fromNow();
          const isOverdue = dayjs(task.dueDate).isBefore(dayjs());
          return (
            <React.Fragment key={task.id}>
              {idx > 0 && <Divider component="li" sx={{ opacity: 0.4 }} />}
              <ListItem
                disablePadding
                secondaryAction={
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={task.status}
                      sx={{
                        fontSize: '0.75rem',
                        height: 28,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.3) },
                      }}
                    >
                      {Object.values(TASK_STATUS).map((s) => (
                        <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.75rem' }}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                }
                sx={{ py: 1, px: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={isChecked}
                    onChange={() => handleToggle(task.id)}
                    icon={<RadioButtonUnchecked sx={{ fontSize: 20, color: alpha(theme.palette.text.secondary, 0.4) }} />}
                    checkedIcon={<CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />}
                    sx={{ p: 0.5 }}
                  />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? 'text.disabled' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <PriorityBadge priority={task.priority} size="small" />
                      <Typography
                        variant="caption"
                        color={isOverdue ? 'error.main' : 'text.secondary'}
                        fontWeight={isOverdue ? 600 : 400}
                      >
                        {isOverdue ? 'Overdue ' : 'Due '}{dueFromNow}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        in {task.project}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </SectionCard>
  );
}

function UpcomingEvents({ events, loading }) {
  const theme = useTheme();

  return (
    <SectionCard
      title="Upcoming Events"
      loading={loading}
      loadingHeight={300}
      empty={!events || events.length === 0}
      emptyProps={{ title: 'No upcoming events', description: 'Scheduled meetings will appear here' }}
      action={
        <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ textTransform: 'none', fontWeight: 500 }}>
          View all
        </Button>
      }
    >
      <List disablePadding>
        {events?.map((event, idx) => (
          <React.Fragment key={event.id}>
            {idx > 0 && <Divider component="li" sx={{ opacity: 0.4 }} />}
            <ListItem disablePadding sx={{ py: 1.5, px: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: event.today ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                    color: event.today ? 'primary.main' : 'secondary.main',
                  }}
                >
                  <Schedule sx={{ fontSize: 20 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" fontWeight={500}>
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      {event.time}
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.attendees} attendees
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Chip
                      label={event.today ? 'Today' : 'Tomorrow'}
                      size="small"
                      color={event.today ? 'primary' : 'default'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                    />
                  </Stack>
                }
              />
              <IconButton size="small" color="primary" sx={{ ml: 1 }}>
                <Videocam sx={{ fontSize: 18 }} />
              </IconButton>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </SectionCard>
  );
}

function NotificationsSection({ notifications, loading }) {
  const theme = useTheme();

  const iconMap = {
    task_assigned: { icon: TaskAlt, color: 'info.main' },
    mention: { icon: CircleIcon, color: 'warning.main' },
    status_change: { icon: PlayCircle, color: 'primary.main' },
    comment: { icon: CircleIcon, color: 'success.main' },
    deadline: { icon: Event, color: 'error.main' },
  };

  return (
    <SectionCard
      title="Notifications"
      loading={loading}
      loadingHeight={350}
      empty={!notifications || notifications.length === 0}
      emptyProps={{ title: 'No notifications', description: 'You\'re all caught up!' }}
      action={
        <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ textTransform: 'none', fontWeight: 500 }}>
          View all
        </Button>
      }
    >
      <List disablePadding>
        {notifications?.slice(0, 4).map((notif, idx) => {
          const config = iconMap[notif.type] || { icon: CircleIcon, color: 'text.secondary' };
          const IconComp = config.icon;
          return (
            <React.Fragment key={notif.id}>
              {idx > 0 && <Divider component="li" sx={{ opacity: 0.4 }} />}
              <ListItem
                disablePadding
                sx={{
                  py: 1.5,
                  px: 0.5,
                  opacity: notif.read ? 0.6 : 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge
                    invisible={notif.read}
                    variant="dot"
                    color="primary"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(notif.read ? theme.palette.text.disabled : config.color, 0.1),
                        color: notif.read ? 'text.disabled' : config.color,
                      }}
                    >
                      <IconComp sx={{ fontSize: 18 }} />
                    </Box>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>
                      {notif.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.3 }}>
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                        {formatRelativeTime(notif.time)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </SectionCard>
  );
}

function TeamMembers({ members, loading }) {
  const theme = useTheme();

  return (
    <SectionCard
      title="Team Members"
      loading={loading}
      loadingHeight={350}
      empty={!members || members.length === 0}
      emptyProps={{ title: 'No team members' }}
      action={
        <IconButton size="small">
          <MoreHoriz sx={{ fontSize: 18 }} />
        </IconButton>
      }
      sx={{ overflow: 'visible' }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
        {members?.map((member) => (
          <Box
            key={member.id}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: member.online ? '#4caf50' : '#bdbdbd',
                    border: '2px solid',
                    borderColor: theme.palette.background.paper,
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  mx: 'auto',
                  mb: 1,
                  fontSize: 14,
                  bgcolor: generateAvatarColor(member.name),
                }}
              >
                {getInitials(member.name)}
              </Avatar>
            </Badge>
            <Typography variant="body2" fontWeight={600} noWrap>
              {member.name.split(' ')[0]}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mb: 0.5 }}>
              {member.role}
            </Typography>
            <Chip
              label={`${member.taskCount} tasks`}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 500,
                borderColor: alpha(theme.palette.divider, 0.2),
              }}
            />
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function SprintProgress({ sprint, loading }) {
  const theme = useTheme();
  const progress = sprint ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100) : 0;

  return (
    <SectionCard
      title="Sprint Progress"
      loading={loading}
      loadingHeight={250}
      empty={!sprint}
      emptyProps={{ title: 'No active sprint', description: 'Sprint data will appear when sprint is active' }}
    >
      {sprint && (
        <Box sx={{ px: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {sprint.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sprint.daysRemaining} days remaining
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {progress}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
              mb: 2.5,
            }}
          />

          <Stack direction="row" justifyContent="space-between">
            {[
              { label: 'To Do', value: sprint.todo, color: theme.palette.info.main },
              { label: 'In Progress', value: sprint.inProgress, color: theme.palette.warning.main },
              { label: 'Done', value: sprint.done, color: theme.palette.success.main },
            ].map((item) => (
              <Box key={item.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color={item.color}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </SectionCard>
  );
}

export default function DashboardPage() {
  const { isDark } = useThemeMode();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(mockStats);
  const [projectStatus, setProjectStatus] = useState(mockProjectStatus);
  const [taskPriority, setTaskPriority] = useState(mockTaskPriority);
  const [weeklyActivity, setWeeklyActivity] = useState(mockWeeklyActivity);
  const [teamProductivity, setTeamProductivity] = useState(mockTeamProductivity);
  const [activities, setActivities] = useState(mockActivities);
  const [myTasks, setMyTasks] = useState(mockMyTasks);
  const [events, setEvents] = useState(mockEvents);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [sprint, setSprint] = useState(mockSprint);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  if (error) {
    return (
      <Box>
        <PageHeader title="Dashboard" subtitle="Welcome to your project management hub" />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Welcome to your project management hub" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={2.5}>
          {statCardsConfig.map((config) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={config.key}>
              <motion.div variants={itemVariants}>
                <StatCard
                  config={config}
                  data={stats?.[config.key]}
                  loading={loading}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2.5 }}>
          <motion.div variants={itemVariants}>
            <ChartSection
              projectStatus={projectStatus}
              taskPriority={taskPriority}
              weeklyActivity={weeklyActivity}
              teamProductivity={teamProductivity}
              loading={loading}
            />
          </motion.div>
        </Box>

        <Grid container spacing={2.5} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <RecentActivities activities={activities} loading={loading} />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <MyTasks tasks={myTasks} loading={loading} />
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: 0 }}>
          <Grid item xs={12} md={5}>
            <motion.div variants={itemVariants}>
              <UpcomingEvents events={events} loading={loading} />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={7}>
            <motion.div variants={itemVariants}>
              <NotificationsSection notifications={notifications} loading={loading} />
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: 0 }}>
          <Grid item xs={12} md={7}>
            <motion.div variants={itemVariants}>
              <TeamMembers members={teamMembers} loading={loading} />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={5}>
            <motion.div variants={itemVariants}>
              <SprintProgress sprint={sprint} loading={loading} />
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}
