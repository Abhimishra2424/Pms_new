import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Tabs, Tab, Stack, Button,
  Avatar, LinearProgress, IconButton, Tooltip, List, ListItem, ListItemAvatar,
  ListItemText, Divider,
} from '@mui/material';
import {
  Edit as EditIcon, Archive as ArchiveIcon, Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon, Task as TaskIcon, CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon, Warning as WarningIcon,
  People as PeopleIcon, AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProjectFormPage from './ProjectFormPage';
import { getProject, deleteProject, archiveProject, getProjectMembers } from '../../api/projectApi';
import { getTasks } from '../../api/taskApi';
import { PROJECT_STATUS } from '../../constants/status';
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

const containerVariants = {
  hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProject(id).then(({ data }) => setProject(data?.data || data)),
      getProjectMembers(id).then(({ data }) => setMembers(data?.data || data || [])),
      getTasks({ projectId: id, limit: 100 }).then(({ data }) => setTasks(data?.data || data || [])),
    ]).catch((err) => {
      toast.error(err.response?.data?.message || 'Failed to load project');
      navigate('/projects');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => {
      if (t.status === 'done' || t.status === 'cancelled') return false;
      return t.dueDate && dayjs(t.dueDate).isBefore(dayjs());
    }).length;
    return {
      total: tasks.length,
      completed,
      inProgress,
      overdue,
      teamSize: members.length,
    };
  }, [tasks, members]);

  const recentActivities = useMemo(() => {
    return tasks
      .flatMap((t) => (t.history || t.activities || []).map((a) => ({ ...a, taskName: t.title, taskId: t.taskId || t._id })))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 10);
  }, [tasks]);

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject(id);
      setProject((prev) => ({ ...prev, status: 'archived' }));
      toast.success('Project archived');
      setArchiveConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive');
    }
  };

  const progress = project?.progress ?? (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0);
  const budgetUsed = project?.budgetUsed ?? (project?.budget ? Math.round((project.budgetSpent || 0) / project.budget * 100) : 0);

  if (loading || !project) return <ProfileSkeleton />;

  const tabs = [
    { label: 'Overview', value: 0 },
    { label: 'Board', value: 1 },
    { label: 'Tasks', value: 2 },
    { label: 'Timeline', value: 3 },
    { label: 'Files', value: 4 },
    { label: 'Settings', value: 5 },
  ];

  const currentTabIndex = tabs.findIndex((t) => {
    const path = location.pathname;
    if (t.label === 'Overview' && path === `/projects/${id}`) return true;
    if (t.label === 'Board' && path === `/projects/${id}/board`) return true;
    if (t.label === 'Tasks' && path.includes(`/projects/${id}/tasks`)) return true;
    if (t.label === 'Timeline' && path === `/projects/${id}/timeline`) return false;
    if (t.label === 'Files' && path === `/projects/${id}/files`) return false;
    if (t.label === 'Settings' && path === `/projects/${id}/settings`) return true;
    return false;
  });

  const handleTabChange = (_, v) => {
    setTabValue(v);
    const tab = tabs[v];
    if (tab.label === 'Board') navigate(`/projects/${id}/board`);
    else if (tab.label === 'Tasks') navigate(`/projects/${id}/tasks`);
    else if (tab.label === 'Settings') navigate(`/projects/${id}/settings`);
    else navigate(`/projects/${id}`);
  };

  const StatCard = ({ icon, label, value, color }) => (
    <motion.div variants={childVariants}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
          <Box sx={{ color: `${color}.main`, mb: 1 }}>{icon}</Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>Back</Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setFormOpen(true)}>Edit</Button>
            {project.status !== 'archived' && (
              <Button variant="outlined" color="warning" startIcon={<ArchiveIcon />} onClick={() => setArchiveConfirm(project)}>Archive</Button>
            )}
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirm(project)}>Delete</Button>
          </Stack>
        }
      />

      <motion.div variants={childVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" gap={0.5}>
                  <Chip label={project.key} size="small" color="primary" variant="filled"
                    sx={{ fontWeight: 600, fontFamily: 'monospace', height: 24 }} />
                  <StatusBadge status={project.status} statusMap={PROJECT_STATUS} size="small" />
                  <PriorityBadge priority={project.priority} size="small" />
                  {project.category && (
                    <Chip label={project.category} size="small" variant="outlined" />
                  )}
                </Stack>
                {project.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                    {project.description}
                  </Typography>
                )}
              </Box>
              {project.lead && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={project.lead.avatar} sx={{ width: 36, height: 36, bgcolor: generateAvatarColor(project.lead.name || '') }}>
                    {getInitials(project.lead.name || `${project.lead.firstName || ''} ${project.lead.lastName || ''}`)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Project Lead</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {project.lead.name || `${project.lead.firstName || ''} ${project.lead.lastName || ''}`.trim()}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<TaskIcon />} label="Total Tasks" value={stats.total} color="primary" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<CheckCircleIcon />} label="Completed" value={stats.completed} color="success" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<HourglassIcon />} label="In Progress" value={stats.inProgress} color="info" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<WarningIcon />} label="Overdue" value={stats.overdue} color="error" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<PeopleIcon />} label="Team Members" value={stats.teamSize} color="warning" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard icon={<MoneyIcon />} label="Budget" value={project.budget ? `$${project.budget}` : '-'} color="secondary" /></Grid>
      </Grid>

      <motion.div variants={childVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Progress</Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Overall Progress</Typography>
                  <Typography variant="body2" fontWeight={600}>{Math.round(progress)}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              {project.budget > 0 && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Budget Used</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${project.budgetSpent || 0} / ${project.budget}
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={budgetUsed} sx={{ height: 8, borderRadius: 4 }}
                    color={budgetUsed > 80 ? 'warning' : 'primary'} />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        {tabs.map((t) => <Tab key={t.label} label={t.label} />)}
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <motion.div variants={childVariants}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Timeline</Typography>
                  {project.startDate || project.endDate ? (
                    <Box sx={{ position: 'relative', py: 2 }}>
                      <Box sx={{
                        position: 'relative', height: 4, bgcolor: 'action.hover', borderRadius: 2, mx: 2,
                      }}>
                        <Box sx={{
                          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 2,
                          bgcolor: 'primary.main', width: `${Math.min(progress, 100)}%`,
                          transition: 'width 0.5s ease',
                        }} />
                      </Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {project.startDate ? formatDate(project.startDate) : 'Start'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.endDate ? formatDate(project.endDate) : 'No end date'}
                        </Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">No timeline set</Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={childVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Recent Activity</Typography>
                  <Divider sx={{ mb: 1 }} />
                  {recentActivities.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                      No recent activity
                    </Typography>
                  ) : (
                    <List dense>
                      {recentActivities.map((item, i) => (
                        <ListItem key={i} divider={i < recentActivities.length - 1} sx={{ px: 0 }}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: generateAvatarColor(item.action || 'activity') }}>
                              {item.action?.charAt(0) || 'A'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <strong>{item.taskName}</strong> - {item.description || item.action || 'Activity'}
                              </Typography>
                            }
                            secondary={item.createdAt ? formatRelativeTime(item.createdAt) : ''}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={5}>
            <motion.div variants={childVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Team Members ({members.length})</Typography>
                  <Divider sx={{ mb: 1 }} />
                  {members.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                      No team members
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {members.map((member) => {
                        const user = member.userId || member;
                        const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
                        const memberTasks = tasks.filter((t) => {
                          const assigneeId = t.assignee?._id || t.assignee?.id || t.assigneeId;
                          return assigneeId === (user._id || user.id);
                        }).length;
                        return (
                          <Stack key={user._id || user.id} direction="row" spacing={1.5} alignItems="center"
                            sx={{ p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                            <Avatar src={user.avatar} sx={{ width: 36, height: 36, bgcolor: generateAvatarColor(name), fontSize: 14 }}>
                              {getInitials(name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>{name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.role || 'Member'} | {memberTasks} tasks
                              </Typography>
                            </Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <EmptyState title="Board" description="Drag and drop tasks on the project board."
          actionText="Open Board" onAction={() => navigate(`/projects/${id}/board`)} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <EmptyState title="Tasks" description="View all project tasks."
          actionText="View Tasks" onAction={() => navigate(`/projects/${id}/tasks`)} />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <EmptyState title="Timeline" description="Project timeline and milestones will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <EmptyState title="Files" description="Project files and documents will appear here." />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <EmptyState title="Settings" description="Manage project settings."
          actionText="Open Settings" onAction={() => navigate(`/projects/${id}/settings`)} />
      </TabPanel>

      <ProjectFormPage
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={project}
        onSuccess={() => {
          getProject(id).then(({ data }) => setProject(data?.data || data));
        }}
      />

      <ConfirmDialog
        open={Boolean(archiveConfirm)}
        title="Archive Project"
        message={`Archive "${project.name}"? You can restore it later.`}
        confirmText="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirm(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Project"
        message={`Delete "${project.name}"? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}