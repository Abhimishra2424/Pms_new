import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  Stack, MenuItem, Typography, Box, Chip, Avatar, IconButton, Switch, FormControlLabel,
  CircularProgress, Tab, Tabs, Autocomplete, Divider, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { createProject, updateProject } from '../../api/projectApi';
import { getEmployees } from '../../api/companyApi';
import { PROJECT_STATUS, PRIORITY } from '../../constants/status';
import RichTextEditor from '../../components/common/RichTextEditor';

const schema = yup.object().shape({
  name: yup.string().required('Project name is required').min(2).max(100),
  key: yup.string().required('Project key is required').matches(/^[A-Z0-9_-]+$/, 'Only uppercase letters, numbers, hyphens and underscores').max(10),
  description: yup.string().nullable(),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  category: yup.string().nullable(),
  clientId: yup.string().nullable(),
  leadId: yup.string().nullable(),
  startDate: yup.string().nullable(),
  endDate: yup.string().nullable(),
  estimatedHours: yup.number().nullable().positive().integer(),
  budget: yup.number().nullable().positive(),
  currency: yup.string().nullable(),
  tags: yup.array().of(yup.string()),
  isPublic: yup.boolean(),
  notificationsEnabled: yup.boolean(),
  members: yup.array().of(yup.object().shape({
    userId: yup.string().required(),
    role: yup.string().required(),
  })),
});

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const DEFAULT_MEMBER_ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'lead', label: 'Lead' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'research', label: 'Research' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'internal', label: 'Internal' },
];

export default function ProjectFormPage({ open, onClose, project, onSuccess }) {
  const isEdit = Boolean(project);
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '', key: '', description: '', status: 'planning', priority: 'medium',
      category: '', clientId: '', leadId: '', startDate: '', endDate: '',
      estimatedHours: '', budget: '', currency: 'USD', tags: [],
      isPublic: true, notificationsEnabled: true, members: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name || '',
          key: project.key || '',
          description: project.description || '',
          status: project.status || 'planning',
          priority: project.priority || 'medium',
          category: project.category || '',
          clientId: project.clientId?._id || project.clientId?.id || project.clientId || '',
          leadId: project.lead?._id || project.lead?.id || project.leadId || '',
          startDate: project.startDate ? project.startDate.split('T')[0] : '',
          endDate: project.endDate ? project.endDate.split('T')[0] : '',
          estimatedHours: project.estimatedHours || '',
          budget: project.budget || '',
          currency: project.currency || 'USD',
          tags: project.tags || [],
          isPublic: project.isPublic !== undefined ? project.isPublic : true,
          notificationsEnabled: project.notificationsEnabled !== undefined ? project.notificationsEnabled : true,
          members: project.members?.map((m) => ({
            userId: m.userId?._id || m.userId?.id || m.userId,
            role: m.role || 'member',
          })) || [],
        });
      } else {
        reset();
      }
    }
  }, [open, project, reset]);

  useEffect(() => {
    if (open) {
      getEmployees({ limit: 200 })
        .then(({ data }) => setEmployees(data?.data || data || []))
        .catch(() => {});
    }
  }, [open]);

  const watchedName = watch('name');

  useEffect(() => {
    if (!isEdit && watchedName) {
      const key = watchedName
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase())
        .join('')
        .substring(0, 6);
      if (key) setValue('key', key);
    }
  }, [watchedName, isEdit, setValue]);

  const handleAddTag = () => {
    const tags = watch('tags') || [];
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setValue('tags', (watch('tags') || []).filter((t) => t !== tag));
  };

  const handleAddMember = (employee) => {
    const members = watch('members') || [];
    if (members.some((m) => m.userId === (employee._id || employee.id))) return;
    setValue('members', [...members, { userId: employee._id || employee.id, role: 'member' }]);
  };

  const handleRemoveMember = (userId) => {
    setValue('members', (watch('members') || []).filter((m) => m.userId !== userId));
  };

  const handleMemberRoleChange = (userId, role) => {
    setValue('members', (watch('members') || []).map((m) =>
      m.userId === userId ? { ...m, role } : m
    ));
  };

  const getEmployeeById = (id) => employees.find((e) => (e._id || e.id) === id);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        budget: data.budget ? Number(data.budget) : undefined,
      };
      if (isEdit) {
        await updateProject(project._id || project.id, payload);
        toast.success('Project updated successfully');
      } else {
        await createProject(payload);
        toast.success('Project created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
    return name.includes(employeeSearch.toLowerCase());
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          {isEdit ? 'Edit Project' : 'Create Project'}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="General" />
            <Tab label="Details" />
            <Tab label="Team" />
            <Tab label="Settings" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Stack spacing={3}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Project Name" error={!!errors.name} helperText={errors.name?.message} fullWidth required autoFocus />
              )} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Controller name="key" control={control} render={({ field }) => (
                    <TextField {...field} label="Project Key" error={!!errors.key} helperText={errors.key?.message} fullWidth required
                      InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 } }}
                      placeholder="PRJ" />
                  )} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller name="status" control={control} render={({ field }) => (
                    <TextField {...field} label="Status" select fullWidth required error={!!errors.status} helperText={errors.status?.message}>
                      {Object.values(PROJECT_STATUS).map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller name="priority" control={control} render={({ field }) => (
                    <TextField {...field} label="Priority" select fullWidth required error={!!errors.priority} helperText={errors.priority?.message}>
                      {Object.values(PRIORITY).map((p) => (
                        <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
              </Grid>
              <Controller name="category" control={control} render={({ field }) => (
                <TextField {...field} label="Category" select fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>
              )} />
              <Controller name="description" control={control} render={({ field }) => (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                  <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                </Box>
              )} />
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller name="clientId" control={control} render={({ field }) => (
                    <TextField {...field} label="Client" select fullWidth>
                      <MenuItem value="">No Client</MenuItem>
                      {clients.map((c) => (
                        <MenuItem key={c._id || c.id} value={c._id || c.id}>
                          {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name="leadId" control={control} render={({ field }) => (
                    <TextField {...field} label="Project Lead" select fullWidth>
                      <MenuItem value="">No Lead</MenuItem>
                      {employees.map((e) => (
                        <MenuItem key={e._id || e.id} value={e._id || e.id}>
                          {`${e.firstName || ''} ${e.lastName || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller name="startDate" control={control} render={({ field }) => (
                    <TextField {...field} label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                  )} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller name="endDate" control={control} render={({ field }) => (
                    <TextField {...field} label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                  )} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Controller name="estimatedHours" control={control} render={({ field }) => (
                    <TextField {...field} label="Estimated Hours" type="number" fullWidth
                      error={!!errors.estimatedHours} helperText={errors.estimatedHours?.message}
                      InputProps={{ inputProps: { min: 0 } }} />
                  )} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller name="budget" control={control} render={({ field }) => (
                    <TextField {...field} label="Budget" type="number" fullWidth
                      error={!!errors.budget} helperText={errors.budget?.message}
                      InputProps={{ inputProps: { min: 0 } }} />
                  )} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller name="currency" control={control} render={({ field }) => (
                    <TextField {...field} label="Currency" select fullWidth>
                      {CURRENCIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </TextField>
                  )} />
                </Grid>
              </Grid>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tags</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                  {(watch('tags') || []).map((tag) => (
                    <Chip key={tag} label={tag} size="small" onDelete={() => handleRemoveTag(tag)} />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Type tag and press Enter"
                  />
                  <Button size="small" variant="outlined" onClick={handleAddTag}><AddIcon fontSize="small" /></Button>
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">Add Team Members</Typography>
              <Autocomplete
                options={filteredEmployees}
                getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''}`.trim() || option.email || ''}
                onInputChange={(_, v) => setEmployeeSearch(v)}
                onChange={(_, value) => { if (value) handleAddMember(value); }}
                renderInput={(params) => (
                  <TextField {...params} size="small" placeholder="Search employees to add..." />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={option.avatar} sx={{ width: 28, height: 28, fontSize: 12 }}>
                        {`${(option.firstName || '')[0]}${(option.lastName || '')[0]}`}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{`${option.firstName || ''} ${option.lastName || ''}`.trim()}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                      </Box>
                    </Stack>
                  </li>
                )}
              />
              <Divider />
              {(watch('members') || []).length === 0 ? (
                <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ py: 2 }}>
                  No team members added yet
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {(watch('members') || []).map((member) => {
                    const emp = getEmployeeById(member.userId);
                    const name = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Unknown';
                    return (
                      <motion.div key={member.userId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{
                          p: 1.5, borderRadius: 1, bgcolor: 'action.hover',
                        }}>
                          <Avatar src={emp?.avatar} sx={{ width: 32, height: 32, fontSize: 13 }}>
                            {name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>{name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp?.email || ''}</Typography>
                          </Box>
                          <TextField
                            select size="small" value={member.role}
                            onChange={(e) => handleMemberRoleChange(member.userId, e.target.value)}
                            sx={{ minWidth: 120 }}
                          >
                            {DEFAULT_MEMBER_ROLES.map((r) => (
                              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                            ))}
                          </TextField>
                          <Tooltip title="Remove">
                            <IconButton size="small" color="error" onClick={() => handleRemoveMember(member.userId)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </motion.div>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <Stack spacing={3}>
              <Controller name="isPublic" control={control} render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>Public Project</Typography>
                      <Typography variant="caption" color="text.secondary">Anyone in the organization can view this project</Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mx: 0 }}
                />
              )} />
              <Divider />
              <Controller name="notificationsEnabled" control={control} render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>Enable Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">Receive updates about project activities</Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mx: 0 }}
                />
              )} />
            </Stack>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={18} /> : null}>
            {submitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}