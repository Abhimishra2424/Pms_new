import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Tabs, Tab,
  Stack, Button, Divider, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon, Phone as PhoneIcon, Cake as CakeIcon,
  LocationOn as LocationIcon, CalendarMonth as CalendarIcon,
  Badge as BadgeIcon, Business as BusinessIcon,
  Edit as EditIcon, ArrowBack as ArrowBackIcon,
  Assignment as TaskIcon, Folder as ProjectIcon,
  TrendingUp as StatsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import {
  fetchEmployeeStart, fetchEmployeeSuccess, fetchEmployeeFailure,
} from '../../redux/slices/employeeSlice';
import { getEmployee, getEmployeeTimeline } from '../../api/companyApi';
import { getInitials, generateAvatarColor, formatDate, formatRelativeTime } from '../../utils/helpers';
import { ROLE_LABELS } from '../../constants/roles';

const GENDER_MAP = {
  male: { label: 'Male', icon: '♂️' },
  female: { label: 'Female', icon: '♀️' },
  other: { label: 'Other', icon: '⚧' },
};

const STATUS_MAP = {
  active: { value: 'active', label: 'Active', color: 'success' },
  inactive: { value: 'inactive', label: 'Inactive', color: 'error' },
  suspended: { value: 'suspended', label: 'Suspended', color: 'warning' },
  terminated: { value: 'terminated', label: 'Terminated', color: 'default' },
};

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEmployee: employee, loading } = useSelector((state) => state.employee);
  const { departments } = useSelector((state) => state.department);
  const { designations } = useSelector((state) => state.designation);

  const [tabValue, setTabValue] = useState(0);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    dispatch(fetchEmployeeStart());
    getEmployee(id)
      .then(({ data }) => dispatch(fetchEmployeeSuccess(data)))
      .catch((err) => dispatch(fetchEmployeeFailure(err.response?.data?.message || err.message)));
  }, [id, dispatch]);

  useEffect(() => {
    if (employee) {
      getEmployeeTimeline(id)
        .then(({ data }) => setTimeline(data?.data || data || []))
        .catch(() => {});
    }
  }, [employee, id]);

  const deptName = useMemo(() => {
    if (!employee?.departmentId || !departments) return '-';
    const deptId = typeof employee.departmentId === 'object' ? employee.departmentId._id || employee.departmentId.id : employee.departmentId;
    const dept = departments.find((d) => (d._id || d.id) === deptId);
    return dept?.name || '-';
  }, [employee, departments]);

  const desigTitle = useMemo(() => {
    if (!employee?.designationId || !designations) return '-';
    const desigId = typeof employee.designationId === 'object' ? employee.designationId._id || employee.designationId.id : employee.designationId;
    const desig = designations.find((d) => (d._id || d.id) === desigId);
    return desig?.title || '-';
  }, [employee, designations]);

  const fullName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : '';

  if (loading || !employee) return <ProfileSkeleton />;

  const StatCard = ({ icon, label, value, color }) => (
    <Card sx={{ flex: 1, minWidth: 140 }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <StatsIcon sx={{ fontSize: 32, color: `${color}.main`, mb: 0.5 }} />
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );

  const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2">{value || '-'}</Typography>
      </Box>
    </Stack>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Employee Detail"
        breadcrumbs={[
          { label: 'Company', href: '/company/settings' },
          { label: 'Employees', href: '/company/employees' },
          { label: fullName },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/company/employees')}>
              Back
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/company/employees/${id}/edit`)}>
              Edit
            </Button>
          </Stack>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
            <Avatar
              src={employee.avatar}
              sx={{ width: 100, height: 100, bgcolor: generateAvatarColor(fullName), fontSize: 40 }}
            >
              {getInitials(fullName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <StatusBadge status={employee.role} statusMap={Object.entries(ROLE_LABELS).reduce((acc, [key, val]) => {
                  acc[key] = { value: key, label: val, color: 'info' };
                  return acc;
                }, {})} />
                <Chip label={employee.status || 'active'} size="small" color={employee.status === 'active' ? 'success' : 'default'} />
                <Chip label={deptName} size="small" variant="outlined" />
                <Chip label={desigTitle} size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {employee.email} {employee.phone ? `| ${employee.phone}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <StatCard icon="task" label="Active Tasks" value={employee.activeTasks ?? 0} color="primary" />
              <StatCard icon="project" label="Projects" value={employee.projectCount ?? 0} color="success" />
              <StatCard icon="attendance" label="Attendance" value={`${employee.attendancePercent ?? 0}%`} color="info" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Overview" />
        <Tab label="Projects" />
        <Tab label="Tasks" />
        <Tab label="Attendance" />
        <Tab label="Leaves" />
        <Tab label="Timesheet" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow icon={<EmailIcon fontSize="small" color="action" />} label="Email" value={employee.email} />
                <InfoRow icon={<PhoneIcon fontSize="small" color="action" />} label="Phone" value={employee.phone} />
                <InfoRow icon={<CakeIcon fontSize="small" color="action" />} label="Date of Birth" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : '-'} />
                <InfoRow icon={<BadgeIcon fontSize="small" color="action" />} label="Gender" value={employee.gender ? GENDER_MAP[employee.gender]?.label || employee.gender : '-'} />
                <InfoRow icon={<LocationIcon fontSize="small" color="action" />} label="Address" value={[employee.address, employee.city, employee.state, employee.country].filter(Boolean).join(', ') || '-'} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Employment Details</Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow icon={<BadgeIcon fontSize="small" color="action" />} label="Employee ID" value={employee.employeeId || '-'} />
                <InfoRow icon={<BusinessIcon fontSize="small" color="action" />} label="Department" value={deptName} />
                <InfoRow icon={<BadgeIcon fontSize="small" color="action" />} label="Designation" value={desigTitle} />
                <InfoRow icon={<CalendarIcon fontSize="small" color="action" />} label="Date of Joining" value={employee.dateOfJoining ? formatDate(employee.dateOfJoining) : '-'} />
                <InfoRow icon={<BadgeIcon fontSize="small" color="action" />} label="Role" value={ROLE_LABELS[employee.role] || employee.role} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Recent Activity</Typography>
                <Divider sx={{ mb: 1 }} />
                {timeline.length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                    No recent activity
                  </Typography>
                ) : (
                  <List dense>
                    {timeline.slice(0, 10).map((item, i) => (
                      <ListItem key={i} divider={i < timeline.length - 1 && i < 9}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: generateAvatarColor(item.action || 'action') }}>
                            {item.action?.charAt(0) || 'A'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.description || item.action || 'Activity'}
                          secondary={item.createdAt ? formatRelativeTime(item.createdAt) : ''}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EmptyState title="Projects" description="Projects assigned to this employee will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <EmptyState title="Tasks" description="Tasks assigned to this employee will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <EmptyState title="Attendance" description="Attendance records will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <EmptyState title="Leaves" description="Leave records will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <EmptyState title="Timesheet" description="Timesheet entries will appear here." />
      </TabPanel>
    </motion.div>
  );
}
