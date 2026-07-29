import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Avatar, IconButton,
  Tooltip, Divider, alpha, useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NotesIcon from '@mui/icons-material/Notes';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import RichTextEditor from '../../components/common/RichTextEditor';
import { MEETING_STATUS } from '../../constants/status';
import { formatDate, formatDateTime, getInitials, generateAvatarColor } from '../../utils/helpers';

const MEETING = {
  id: 1, title: 'Sprint Planning', description: 'Plan sprint 12 tasks and assign stories',
  date: '2026-08-03', startTime: '10:00', endTime: '11:00', status: 'scheduled',
  project: { id: 'p1', name: 'Website Redesign', color: '#3b82f6' },
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  recordingLink: 'https://drive.google.com/recording-link',
  notes: '<h2>Agenda</h2><ul><li>Review sprint 11 completion</li><li>Discuss sprint 12 priorities</li><li>Assign tasks</li></ul>',
  attendees: [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '', status: 'accepted' },
    { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', avatar: '', status: 'accepted' },
    { id: 'u3', name: 'Carol Davis', email: 'carol@example.com', avatar: '', status: 'pending' },
    { id: 'u4', name: 'David Wilson', email: 'david@example.com', avatar: '', status: 'declined' },
  ],
};

const ATTENDEE_STATUS = { accepted: { color: '#22c55e', icon: <CheckCircleIcon fontSize="small" /> }, declined: { color: '#ef4444', icon: <CancelIcon fontSize="small" /> }, pending: { color: '#f97316', icon: <HourglassEmptyIcon fontSize="small" /> } };

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const meeting = MEETING;

  const duration = dayjs(`2000-01-01 ${meeting.endTime}`).diff(dayjs(`2000-01-01 ${meeting.startTime}`), 'minute');

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title={meeting.title}
        breadcrumbs={[{ label: 'Meetings', href: '/meetings' }, { label: meeting.title }]}
        actions={
          <Stack direction="row" spacing={1}>
            {meeting.meetingLink && (
              <Button variant="contained" startIcon={<VideocamIcon />} color="success" href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                Join Meeting
              </Button>
            )}
            <Tooltip title="Edit"><IconButton><EditIcon /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton color="error"><DeleteIcon /></IconButton></Tooltip>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <StatusBadge status={meeting.status} statusMap={MEETING_STATUS} size="medium" />
        <Chip icon={<PeopleIcon />} label={`${meeting.attendees.length} attendees`} size="small" variant="outlined" />
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <motion.div variants={childVariants}>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[
                { icon: <CalendarTodayIcon />, label: 'Date', value: formatDate(meeting.date) },
                { icon: <AccessTimeIcon />, label: 'Time', value: `${meeting.startTime} - ${meeting.endTime}` },
                { icon: <AccessTimeIcon />, label: 'Duration', value: `${duration} min` },
                { icon: <FolderOpenIcon />, label: 'Project', value: meeting.project.name },
              ].map((info) => (
                <Grid item xs={6} sm={3} key={info.label}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ color: theme.palette.primary.main, mb: 0.5 }}>{info.icon}</Box>
                      <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{info.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <LinkIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>Meeting Link</Typography>
                </Stack>
                {meeting.meetingLink ? (
                  <Button variant="outlined" endIcon={<OpenInNewIcon />} href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                    {meeting.meetingLink}
                  </Button>
                ) : <Typography color="text.disabled">No meeting link provided</Typography>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <NotesIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>Notes</Typography>
                </Stack>
                {meeting.notes ? (
                  <Box sx={{ '& img': { maxWidth: '100%' } }} dangerouslySetInnerHTML={{ __html: meeting.notes }} />
                ) : (
                  <RichTextEditor value="" onChange={() => {}} height={200} placeholder="Add meeting notes..." />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <VideocamIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>Recording</Typography>
                </Stack>
                {meeting.recordingLink ? (
                  <Button variant="outlined" endIcon={<OpenInNewIcon />} href={meeting.recordingLink} target="_blank" rel="noopener noreferrer">
                    View Recording
                  </Button>
                ) : <Typography color="text.disabled">No recording available</Typography>}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <PeopleIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>Attendees</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {meeting.attendees.map((a) => {
                    const attStatus = ATTENDEE_STATUS[a.status];
                    return (
                      <Stack key={a.id} direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: generateAvatarColor(a.name), fontSize: 12 }}>
                          {getInitials(a.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{a.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                        </Box>
                        <Tooltip title={a.status}>
                          <Box sx={{ color: attStatus.color }}>{attStatus.icon}</Box>
                        </Tooltip>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
