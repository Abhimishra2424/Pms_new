import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Divider,
  Stack, Switch, FormControlLabel, CircularProgress, MenuItem, Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import { getProject, updateProject, deleteProject, archiveProject } from '../../api/projectApi';
import { PROJECT_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/helpers';

export default function ProjectSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
  const [generalForm, setGeneralForm] = useState({ name: '', description: '', status: '' });
  const [datesForm, setDatesForm] = useState({ startDate: '', endDate: '', deadline: '' });
  const [budgetForm, setBudgetForm] = useState({ estimatedHours: '', budget: '', currency: 'USD' });

  useEffect(() => {
    setLoading(true);
    getProject(id)
      .then(({ data }) => {
        const p = data?.data || data;
        setProject(p);
        setGeneralForm({
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'planning',
        });
        setDatesForm({
          startDate: p.startDate ? p.startDate.split('T')[0] : '',
          endDate: p.endDate ? p.endDate.split('T')[0] : '',
          deadline: p.deadline ? p.deadline.split('T')[0] : '',
        });
        setBudgetForm({
          estimatedHours: p.estimatedHours || '',
          budget: p.budget || '',
          currency: p.currency || 'USD',
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load project');
        navigate('/projects');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const { data } = await updateProject(id, generalForm);
      setProject((prev) => ({ ...prev, ...(data?.data || data) }));
      toast.success('General settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDates = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (datesForm.startDate) payload.startDate = datesForm.startDate;
      if (datesForm.endDate) payload.endDate = datesForm.endDate;
      if (datesForm.deadline) payload.deadline = datesForm.deadline;
      const { data } = await updateProject(id, payload);
      setProject((prev) => ({ ...prev, ...(data?.data || data) }));
      toast.success('Dates saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      const payload = {
        estimatedHours: budgetForm.estimatedHours ? Number(budgetForm.estimatedHours) : undefined,
        budget: budgetForm.budget ? Number(budgetForm.budget) : undefined,
        currency: budgetForm.currency,
      };
      const { data } = await updateProject(id, payload);
      setProject((prev) => ({ ...prev, ...(data?.data || data) }));
      toast.success('Budget saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject(id);
      toast.success('Project archived');
      setArchiveConfirm(null);
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      setDeleteConfirm(null);
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading || !project) return <ProfileSkeleton />;

  const statusOptions = Object.values(PROJECT_STATUS).map((s) => ({ value: s.value, label: s.label }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Project Settings"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name, href: `/projects/${id}` },
          { label: 'Settings' },
        ]}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/projects/${id}`)}>
            Back to Project
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>General</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    label="Project Name" fullWidth size="small"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <TextField
                    label="Project Key" fullWidth size="small"
                    value={project.key || ''}
                    InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontWeight: 600 } }}
                    helperText="Key cannot be changed after creation"
                  />
                  <TextField
                    label="Description" fullWidth size="small" multiline rows={3}
                    value={generalForm.description}
                    onChange={(e) => setGeneralForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <TextField
                    label="Status" select fullWidth size="small"
                    value={generalForm.status}
                    onChange={(e) => setGeneralForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    {statusOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained" startIcon={<SaveIcon />}
                      onClick={handleSaveGeneral}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={18} /> : 'Save'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Dates</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    label="Start Date" type="date" fullWidth size="small"
                    value={datesForm.startDate}
                    onChange={(e) => setDatesForm((f) => ({ ...f, startDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Date" type="date" fullWidth size="small"
                    value={datesForm.endDate}
                    onChange={(e) => setDatesForm((f) => ({ ...f, endDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Deadline" type="date" fullWidth size="small"
                    value={datesForm.deadline}
                    onChange={(e) => setDatesForm((f) => ({ ...f, deadline: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained" startIcon={<SaveIcon />}
                      onClick={handleSaveDates}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={18} /> : 'Save'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Budget</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    label="Estimated Hours" type="number" fullWidth size="small"
                    value={budgetForm.estimatedHours}
                    onChange={(e) => setBudgetForm((f) => ({ ...f, estimatedHours: e.target.value }))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <TextField
                    label="Budget" type="number" fullWidth size="small"
                    value={budgetForm.budget}
                    onChange={(e) => setBudgetForm((f) => ({ ...f, budget: e.target.value }))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <TextField
                    label="Currency" select fullWidth size="small"
                    value={budgetForm.currency}
                    onChange={(e) => setBudgetForm((f) => ({ ...f, currency: e.target.value }))}
                  >
                    {[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                      { value: 'INR', label: 'INR (₹)' },
                    ].map((c) => (
                      <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained" startIcon={<SaveIcon />}
                      onClick={handleSaveBudget}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={18} /> : 'Save'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <Card sx={{ borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} color="error" gutterBottom>Danger Zone</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    These actions are irreversible. Please proceed with caution.
                  </Alert>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>Archive this project</Typography>
                      <Typography variant="caption" color="text.secondary">
                        The project will be hidden from active lists but can be restored later.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined" color="warning" startIcon={<ArchiveIcon />}
                      onClick={() => setArchiveConfirm(project)}
                      disabled={project.status === 'archived'}
                    >
                      Archive
                    </Button>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="error">Delete this project</Typography>
                      <Typography variant="caption" color="error">
                        Permanently delete this project and all its data. This cannot be undone.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained" color="error" startIcon={<DeleteIcon />}
                      onClick={() => setDeleteConfirm(project)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(archiveConfirm)}
        title="Archive Project"
        message={`Are you sure you want to archive "${project.name}"?`}
        confirmText="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirm(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}