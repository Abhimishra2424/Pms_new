import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Box, Typography, FormControl,
  InputLabel, Select, MenuItem, Chip, IconButton, CircularProgress,
  alpha, useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RichTextEditor from '../../components/common/RichTextEditor';
import FileUpload from '../../components/common/FileUpload';
import { TASK_STATUS, PRIORITY, BUG_SEVERITY } from '../../constants/status';

const taskSchema = yup.object({
  title: yup.string().required('Title is required').min(2, 'Min 2 characters').max(300, 'Max 300 characters'),
  description: yup.string(),
  projectId: yup.string().required('Project is required'),
  type: yup.string().required('Type is required'),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  severity: yup.string(),
  assigneeId: yup.string().nullable(),
  sprintId: yup.string().nullable(),
  epicId: yup.string().nullable(),
  milestoneId: yup.string().nullable(),
  labels: yup.array().of(yup.string()),
  storyPoints: yup.number().nullable().min(0, 'Cannot be negative'),
  estimatedHours: yup.number().nullable().min(0, 'Cannot be negative'),
  dueDate: yup.date().nullable(),
  startDate: yup.date().nullable(),
  parentTaskId: yup.string().nullable(),
  dependencies: yup.array().of(yup.string()),
});

const TASK_TYPES = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'story', label: 'Story' },
  { value: 'subtask', label: 'Subtask' },
];

const STATUS_OPTIONS = Object.values(TASK_STATUS).map((s) => ({ value: s.value, label: s.label }));
const PRIORITY_OPTIONS = Object.values(PRIORITY).map((p) => ({ value: p.value, label: p.label }));
const SEVERITY_OPTIONS = Object.values(BUG_SEVERITY).map((s) => ({ value: s.value, label: s.label }));

export default function TaskFormDialog({ open, onClose, onSuccess, task }) {
  const theme = useTheme();
  const isEdit = Boolean(task);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [labelInput, setLabelInput] = useState('');
  const [files, setFiles] = useState([]);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '', description: '', projectId: '', type: 'task',
      status: 'todo', priority: 'medium', severity: '',
      assigneeId: null, sprintId: null, epicId: null, milestoneId: null,
      labels: [], storyPoints: null, estimatedHours: null,
      dueDate: null, startDate: null, parentTaskId: null, dependencies: [],
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedType = watch('type');
  const selectedLabels = watch('labels') || [];

  const fetchDependencies = useCallback(async () => {
    try {
      const { getProjects } = await import('../../api/projectApi');
      const { getEmployees } = await import('../../api/companyApi');
      const { getTasks } = await import('../../api/taskApi');

      const [projectRes, empRes, taskRes] = await Promise.all([
        getProjects({ limit: 200 }),
        getEmployees({ limit: 200 }),
        getTasks({ limit: 200 }),
      ]);

      setProjects(projectRes.data?.data || projectRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
      setTasks(taskRes.data?.data || taskRes.data || []);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  }, []);

  useEffect(() => {
    if (open) fetchDependencies();
  }, [open, fetchDependencies]);

  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || task.project?._id || task.project?.id || '',
        type: task.type || 'task',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        severity: task.severity || '',
        assigneeId: task.assigneeId || task.assignee?._id || task.assignee?.id || null,
        sprintId: task.sprintId || task.sprint?._id || task.sprint?.id || null,
        epicId: task.epicId || task.epic?._id || task.epic?.id || null,
        milestoneId: task.milestoneId || task.milestone?._id || task.milestone?.id || null,
        labels: task.labels || [],
        storyPoints: task.storyPoints ?? null,
        estimatedHours: task.estimatedHours ?? null,
        dueDate: task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : null,
        startDate: task.startDate ? dayjs(task.startDate).format('YYYY-MM-DD') : null,
        parentTaskId: task.parentTaskId || task.parentTask?._id || task.parentTask?.id || null,
        dependencies: task.dependencies?.map((d) => d._id || d.id || d) || [],
      });
      setFiles(task.attachments || []);
    }
  }, [task, open, reset]);

  const projectEmployees = useMemo(() => {
    const project = projects.find((p) => (p._id || p.id) === selectedProjectId);
    if (project?.members) return project.members;
    return employees;
  }, [selectedProjectId, projects, employees]);

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter((t) => {
      const tProject = t.projectId || t.project?._id || t.project?.id;
      return tProject === selectedProjectId;
    });
  }, [selectedProjectId, tasks]);

  const projectSprints = useMemo(() => {
    return sprints.filter((s) => {
      const sProject = s.projectId || s.project?._id || s.project?.id;
      return sProject === selectedProjectId;
    });
  }, [selectedProjectId, sprints]);

  const addLabel = () => {
    if (labelInput.trim() && !selectedLabels.includes(labelInput.trim())) {
      setValue('labels', [...selectedLabels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const removeLabel = (label) => {
    setValue('labels', selectedLabels.filter((l) => l !== label));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.dueDate) payload.dueDate = dayjs(payload.dueDate).toISOString();
      if (payload.startDate) payload.startDate = dayjs(payload.startDate).toISOString();
      if (files.length > 0) payload.attachments = files;

      const { createTask, updateTask } = await import('../../api/taskApi');

      if (isEdit) {
        await updateTask(task._id || task.id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload);
        toast.success('Task created');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = useMemo(() =>
    projectEmployees.map((e) => {
      const name = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'User';
      return { value: e._id || e.id, label: name };
    }), [projectEmployees]);

  const taskOptions = useMemo(() =>
    projectTasks
      .filter((t) => !task || (t._id || t.id) !== (task._id || task.id))
      .map((t) => ({ value: t._id || t.id, label: t.title })), [projectTasks, task]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            {isEdit ? 'Edit Task' : 'Create Task'}
          </Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Title */}
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} label="Title" required fullWidth autoFocus error={!!errors.title} helperText={errors.title?.message} />
            )} />

            {/* Description */}
            <Controller name="description" control={control} render={({ field }) => (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Description</Typography>
                <RichTextEditor value={field.value || ''} onChange={field.onChange} height={200} />
              </Box>
            )} />

            {/* Project + Type */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="projectId" control={control} render={({ field }) => (
                <FormControl fullWidth error={!!errors.projectId} required>
                  <InputLabel>Project</InputLabel>
                  <Select {...field} label="Project" value={field.value || ''}>
                    {projects.map((p) => (
                      <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller name="type" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select {...field} label="Type">
                    {TASK_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
            </Stack>

            {/* Status + Priority + Severity */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="status" control={control} render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller name="priority" control={control} render={({ field }) => (
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select {...field} label="Priority">
                    {PRIORITY_OPTIONS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              {selectedType === 'bug' && (
                <Controller name="severity" control={control} render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select {...field} label="Severity" value={field.value || ''}>
                      {SEVERITY_OPTIONS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              )}
            </Stack>

            {/* Assignee + Sprint + Epic + Milestone */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="assigneeId" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select {...field} label="Assignee" value={field.value || ''}>
                    <MenuItem value="">Unassigned</MenuItem>
                    {employeeOptions.map((e) => (
                      <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller name="sprintId" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Sprint</InputLabel>
                  <Select {...field} label="Sprint" value={field.value || ''}>
                    <MenuItem value="">None</MenuItem>
                    {projectSprints.map((s) => (
                      <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="epicId" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Epic</InputLabel>
                  <Select {...field} label="Epic" value={field.value || ''}>
                    <MenuItem value="">None</MenuItem>
                    {epics.map((e) => (
                      <MenuItem key={e._id || e.id} value={e._id || e.id}>{e.name || e.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller name="milestoneId" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Milestone</InputLabel>
                  <Select {...field} label="Milestone" value={field.value || ''}>
                    <MenuItem value="">None</MenuItem>
                    {milestones.map((m) => (
                      <MenuItem key={m._id || m.id} value={m._id || m.id}>{m.name || m.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
            </Stack>

            {/* Labels */}
            <Controller name="labels" control={control} render={({ field }) => (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Labels</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                  {selectedLabels.map((label) => (
                    <Chip key={label} label={label} size="small" onDelete={() => removeLabel(label)} />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Add label"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
                  />
                  <IconButton size="small" color="primary" onClick={addLabel}><AddIcon /></IconButton>
                </Stack>
              </Box>
            )} />

            {/* Story Points + Estimated Hours */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="storyPoints" control={control} render={({ field }) => (
                <TextField {...field} label="Story Points" type="number" fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  inputProps={{ min: 0 }}
                />
              )} />
              <Controller name="estimatedHours" control={control} render={({ field }) => (
                <TextField {...field} label="Estimated Hours" type="number" fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              )} />
            </Stack>

            {/* Due Date + Start Date */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller name="dueDate" control={control} render={({ field }) => (
                <TextField {...field} label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
                  value={field.value || ''}
                />
              )} />
              <Controller name="startDate" control={control} render={({ field }) => (
                <TextField {...field} label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
                  value={field.value || ''}
                />
              )} />
            </Stack>

            {/* Parent Task */}
            <Controller name="parentTaskId" control={control} render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Parent Task (for subtasks)</InputLabel>
                <Select {...field} label="Parent Task (for subtasks)" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {taskOptions.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )} />

            {/* Dependencies */}
            <Controller name="dependencies" control={control} render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Dependencies</InputLabel>
                <Select {...field} label="Dependencies" multiple
                  value={field.value || []}
                  onChange={(e) => field.onChange(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((val) => {
                        const t = tasks.find((task) => (task._id || task.id) === val);
                        return <Chip key={val} label={t?.title || val} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {taskOptions.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )} />

            {/* Attachments */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Attachments</Typography>
              <FileUpload files={files} onFilesChange={setFiles} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {isEdit ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}