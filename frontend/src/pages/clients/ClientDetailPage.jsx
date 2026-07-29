import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Avatar, Chip, Tabs, Tab,
  IconButton, Tooltip, Divider, List, ListItem, ListItemAvatar, ListItemText, alpha, useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import { motion } from 'framer-motion';
import PageHeader from '../../components/common/PageHeader';
import { getInitials, generateAvatarColor, formatDate } from '../../utils/helpers';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

const CLIENT = {
  id: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0100',
  company: 'Acme Corporation', website: 'https://acme.com', address: '123 Main Street, New York, NY 10001',
  status: 'active', avatar: '', notes: 'Key client for the website redesign project.',
  projects: [
    { id: 'p1', name: 'Website Redesign', status: 'in_progress' },
    { id: 'p2', name: 'Brand Refresh', status: 'planning' },
  ],
  invoices: [
    { id: 'INV-001', amount: 15000, status: 'paid', date: '2026-07-15' },
    { id: 'INV-002', amount: 8500, status: 'sent', date: '2026-08-01' },
  ],
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const client = CLIENT;

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title={client.name}
        breadcrumbs={[{ label: 'Clients', href: '/clients' }, { label: client.name }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Delete</Button>
          </Stack>
        }
      />

      <motion.div variants={childVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar src={client.avatar} sx={{ width: 72, height: 72, bgcolor: generateAvatarColor(client.name), fontSize: 28 }}>
              {getInitials(client.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>{client.name}</Typography>
                <Chip label={client.status} size="small" color={client.status === 'active' ? 'success' : 'default'} variant="outlined" />
              </Stack>
              <Typography color="text.secondary">{client.company}</Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Contact</Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client.email}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LanguageIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client.website}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="h6" fontWeight={600}>Address</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">{client.address}</Typography>
              </CardContent>
            </Card>
          </motion.div>

          {client.notes && (
            <motion.div variants={childVariants}>
              <Card sx={{ mt: 2.5 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <NotesIcon fontSize="small" color="action" />
                    <Typography variant="h6" fontWeight={600}>Notes</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{client.notes}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div variants={childVariants}>
            <Card>
              <CardContent sx={{ pb: '0 !important' }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                  <Tab icon={<FolderOpenIcon />} label="Projects" iconPosition="start" />
                  <Tab icon={<ReceiptIcon />} label="Invoices" iconPosition="start" />
                  <Tab icon={<HistoryIcon />} label="Activity" iconPosition="start" />
                </Tabs>
              </CardContent>
            </Card>

            <TabPanel value={tabValue} index={0}>
              <Card>
                <List disablePadding>
                  {client.projects.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem
                        button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        secondaryAction={<Chip label={p.status.replace('_', ' ')} size="small" variant="outlined" color={p.status === 'in_progress' ? 'primary' : 'default'} />}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            <FolderOpenIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={p.name} secondary={`Project ID: ${p.id}`} />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Card>
                <List disablePadding>
                  {client.invoices.map((inv, idx) => (
                    <React.Fragment key={inv.id}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem button onClick={() => navigate(`/invoices/${inv.id}`)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                            <ReceiptIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={inv.id} secondary={`${formatDate(inv.date)} - $${inv.amount.toLocaleString()}`} />
                        <Chip label={inv.status} size="small" color={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'info' : 'default'} variant="outlined" />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No recent activity</Typography>
              </Card>
            </TabPanel>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
