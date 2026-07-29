import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Switch, FormControlLabel, IconButton, Tooltip,
  Collapse, Fab, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ArchiveIcon from '@mui/icons-material/Archive';
import PersonIcon from '@mui/icons-material/Person';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import RichTextEditor from '../../components/common/RichTextEditor';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ef4444', icon: <PriorityHighIcon /> },
  high: { label: 'High', color: '#f97316', icon: <WarningIcon /> },
  medium: { label: 'Medium', color: '#3b82f6', icon: <InfoIcon /> },
  low: { label: 'Low', color: '#64748b', icon: <LowPriorityIcon /> },
};

const ROLES = ['All', 'Admin', 'Project Manager', 'Developer', 'Designer', 'Employee'];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Critical System Maintenance', content: '<p>System will be down for maintenance on Aug 5th from 2-4 AM.</p>', priority: 'urgent', author: 'Admin', avatar: '', date: '2026-08-01', status: 'published', audience: ['All'], views: 156 },
  { id: 2, title: 'New Feature Release: Gantt Charts', content: '<p>We are excited to announce the release of Gantt chart view for all projects.</p>', priority: 'high', author: 'Alice Johnson', avatar: '', date: '2026-07-28', status: 'published', audience: ['All'], views: 89 },
  { id: 3, title: 'Office Holiday Calendar Updated', content: '<p>Please check the updated holiday calendar for 2026.</p>', priority: 'medium', author: 'HR Team', avatar: '', date: '2026-07-25', status: 'published', audience: ['All'], views: 45 },
  { id: 4, title: 'Team Building Event', content: '<p>Annual team building event scheduled for September 15th.</p>', priority: 'low', author: 'Admin', avatar: '', date: '2026-07-20', status: 'draft', audience: ['All'], views: 0 },
  { id: 5, title: 'Security Awareness Training', content: '<p>Mandatory security training for all employees.</p>', priority: 'high', author: 'Admin', avatar: '', date: '2026-07-18', status: 'published', audience: ['All'], views: 234 },
];

export default function AnnouncementPage() {
  const theme = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', content: '', priority: 'medium', audience: [], published: false,
  });

  const handleCreate = () => {
    toast.success(formData.published ? 'Announcement published' : 'Draft saved');
    setFormOpen(false);
    setFormData({ title: '', content: '', priority: 'medium', audience: [], published: false });
  };

  const handlePublish = (id) => toast.success('Announcement published');
  const handleArchive = (id) => toast.success('Announcement archived');

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Announcements"
        subtitle="Company announcements"
        breadcrumbs={[{ label: 'Announcements' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Create Announcement
          </Button>
        }
      />

      <Stack spacing={1.5}>
        {MOCK_ANNOUNCEMENTS.map((announcement) => {
          const priority = PRIORITY_CONFIG[announcement.priority];
          const isExpanded = expandedId === announcement.id;
          return (
            <motion.div key={announcement.id} variants={childVariants}>
              <Card
                sx={{
                  cursor: 'pointer',
                  borderLeft: `4px solid ${priority.color}`,
                  '&:hover': { boxShadow: 3 },
                  bgcolor: announcement.status === 'draft' ? alpha(theme.palette.warning.main, 0.04) : 'background.paper',
                }}
                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ color: priority.color, mt: 0.5 }}>{priority.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={600}>{announcement.title}</Typography>
                        <Chip label={announcement.status} size="small" variant="outlined" color={announcement.status === 'published' ? 'success' : 'warning'} />
                        <Chip label={priority.label} size="small" sx={{ bgcolor: alpha(priority.color, 0.12), color: priority.color, fontWeight: 600 }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {announcement.content.replace(/<[^>]*>/g, '')}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Avatar src={announcement.avatar} sx={{ width: 24, height: 24, fontSize: 10, bgcolor: generateAvatarColor(announcement.author) }}>
                            {getInitials(announcement.author)}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">{announcement.author}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.disabled">{formatRelativeTime(announcement.date)}</Typography>
                        {announcement.views > 0 && <Typography variant="caption" color="text.disabled">{announcement.views} views</Typography>}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      {announcement.status !== 'published' && (
                        <Tooltip title="Publish"><IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handlePublish(announcement.id); }}><PublishedWithChangesIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      {announcement.status === 'published' && (
                        <Tooltip title="Archive"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleArchive(announcement.id); }}><ArchiveIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Stack>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setFormOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField select label="Priority" value={formData.priority} onChange={(e) => setFormData((f) => ({ ...f, priority: e.target.value }))} fullWidth>
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => <MenuItem key={key} value={key}>{cfg.label}</MenuItem>)}
            </TextField>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <RichTextEditor value={formData.content} onChange={(v) => setFormData((f) => ({ ...f, content: v }))} height={300} />
            </Box>
            <TextField select label="Target Audience" value={formData.audience} onChange={(e) => setFormData((f) => ({ ...f, audience: e.target.value }))} SelectProps={{ multiple: true }} fullWidth>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <FormControlLabel control={<Switch checked={formData.published} onChange={(e) => setFormData((f) => ({ ...f, published: e.target.checked }))} />} label="Publish immediately" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={formData.published ? <CampaignIcon /> : <AddIcon />} onClick={handleCreate} disabled={!formData.title}>
            {formData.published ? 'Publish' : 'Save Draft'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
