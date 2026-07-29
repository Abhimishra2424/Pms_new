import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, TextField, MenuItem, Switch,
  FormControlLabel, Divider, Avatar, IconButton, Tabs, Tab, alpha, useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'AED'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'];
const TIME_FORMATS = ['12h', '24h'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Hindi'];

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ py: 3 }}>{children}</Box>;
}

const SECTIONS = [
  { label: 'General', icon: <BusinessIcon /> },
  { label: 'Preferences', icon: <LanguageIcon /> },
  { label: 'Notifications', icon: <NotificationsIcon /> },
  { label: 'Security', icon: <SecurityIcon /> },
  { label: 'SMTP', icon: <SendIcon /> },
  { label: 'Theme', icon: <PaletteIcon /> },
];

export default function SettingsPage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [themeMode, setThemeMode] = useState('light');
  const [general, setGeneral] = useState({ companyName: 'Acme Corp', website: 'https://acme.com', logo: null });
  const [preferences, setPreferences] = useState({ timezone: 'Asia/Kolkata', currency: 'USD', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', language: 'English' });
  const [notifications, setNotifications] = useState({ email: true, push: true, digest: false, mention: true, taskUpdate: true });
  const [security, setSecurity] = useState({ twoFactor: false, currentPassword: '', newPassword: '', confirmPassword: '' });
  const [smtp, setSmtp] = useState({ host: 'smtp.example.com', port: '587', user: 'noreply@acme.com', password: '', fromEmail: 'noreply@acme.com' });

  const handleSave = (section) => {
    toast.success(`${section} settings saved`);
  };

  const handleTestConnection = () => {
    toast.success('SMTP connection test successful');
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <motion.div variants={childVariants}>
            <Card>
              <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{ '& .MuiTab-root': { alignItems: 'flex-start', minHeight: 48, px: 2 } }}
              >
                {SECTIONS.map((s, idx) => (
                  <Tab key={s.label} icon={s.icon} label={s.label} iconPosition="start" value={idx} />
                ))}
              </Tabs>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={9}>
          <motion.div variants={childVariants}>
            <TabPanel value={tabValue} index={0}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>General Settings</Typography>
                  <Stack spacing={2.5} maxWidth={500}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={general.logo} sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <BusinessIcon />
                      </Avatar>
                      <Button variant="outlined">Upload Logo</Button>
                    </Stack>
                    <TextField label="Company Name" value={general.companyName} onChange={(e) => setGeneral({ ...general, companyName: e.target.value })} fullWidth />
                    <TextField label="Website" value={general.website} onChange={(e) => setGeneral({ ...general, website: e.target.value })} fullWidth />
                    <Box>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('General')}>Save</Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Preferences</Typography>
                  <Stack spacing={2.5} maxWidth={500}>
                    <TextField select label="Timezone" value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })} fullWidth>
                      {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                    </TextField>
                    <TextField select label="Currency" value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })} fullWidth>
                      {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField select label="Date Format" value={preferences.dateFormat} onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })} fullWidth>
                      {DATE_FORMATS.map((df) => <MenuItem key={df} value={df}>{df}</MenuItem>)}
                    </TextField>
                    <TextField select label="Time Format" value={preferences.timeFormat} onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })} fullWidth>
                      {TIME_FORMATS.map((tf) => <MenuItem key={tf} value={tf}>{tf}</MenuItem>)}
                    </TextField>
                    <TextField select label="Language" value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })} fullWidth>
                      {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    </TextField>
                    <Box>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Preferences')}>Save</Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Notification Settings</Typography>
                  <Stack spacing={2} maxWidth={500}>
                    <FormControlLabel control={<Switch checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} />} label="Email Notifications" />
                    <FormControlLabel control={<Switch checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} />} label="Push Notifications" />
                    <FormControlLabel control={<Switch checked={notifications.digest} onChange={(e) => setNotifications({ ...notifications, digest: e.target.checked })} />} label="Daily Digest" />
                    <FormControlLabel control={<Switch checked={notifications.mention} onChange={(e) => setNotifications({ ...notifications, mention: e.target.checked })} />} label="Mentions" />
                    <FormControlLabel control={<Switch checked={notifications.taskUpdate} onChange={(e) => setNotifications({ ...notifications, taskUpdate: e.target.checked })} />} label="Task Updates" />
                    <Box sx={{ mt: 1 }}>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Notifications')}>Save</Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Card sx={{ mb: 2.5 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Security</Typography>
                  <Stack spacing={2.5} maxWidth={500}>
                    <FormControlLabel control={<Switch checked={security.twoFactor} onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })} />} label="Two-Factor Authentication" />
                    <Divider />
                    <Typography variant="subtitle2" fontWeight={600}>Change Password</Typography>
                    <TextField label="Current Password" type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} fullWidth />
                    <TextField label="New Password" type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} fullWidth />
                    <TextField label="Confirm New Password" type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} fullWidth />
                    <Box>
                      <Button variant="contained" onClick={handleChangePassword} disabled={!security.currentPassword || !security.newPassword || !security.confirmPassword}>
                        Change Password
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>SMTP Configuration</Typography>
                  <Stack spacing={2.5} maxWidth={500}>
                    <TextField label="SMTP Host" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} fullWidth />
                    <TextField label="Port" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} fullWidth />
                    <TextField label="Username" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} fullWidth />
                    <TextField label="Password" type="password" value={smtp.password} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} fullWidth />
                    <TextField label="From Email" value={smtp.fromEmail} onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })} fullWidth />
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('SMTP')}>Save</Button>
                      <Button variant="outlined" startIcon={<CloudIcon />} onClick={handleTestConnection}>Test Connection</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Theme Settings</Typography>
                  <Stack spacing={2.5} maxWidth={500}>
                    <FormControlLabel
                      control={<Switch checked={themeMode === 'dark'} onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')} />}
                      label={`${themeMode === 'dark' ? 'Dark' : 'Light'} Mode`}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {themeMode === 'dark' ? 'Dark theme reduces eye strain in low-light environments.' : 'Light theme provides optimal visibility in bright environments.'}
                    </Typography>
                    <Box>
                      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave('Theme')}>Save</Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
