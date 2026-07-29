import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Avatar, IconButton, Button,
  TextField, Select, MenuItem, FormControl, Tooltip,
  Divider, alpha, useTheme, Grid, LinearProgress,
  Dialog, DialogTitle, DialogContent, Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import BlockIcon from '@mui/icons-material/Block';
import LabelIcon from '@mui/icons-material/Label';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RichTextEditor from '../../components/common/RichTextEditor';
import FileUpload from '../../components/common/FileUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import { TASK_STATUS, PRIORITY } from '../../constants/status';
import {
  formatDateTime, formatRelativeTime,
  getInitials, generateAvatarColor,
} from '../../utils/helpers';

const STATUS_OPTIONS = Object.values(TASK_STATUS);
const PRIORITY_OPTIONS = Object.values(PRIORITY);

function EditableField({ value, onSave, renderDisplay, renderEdit, onCancel }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
    onCancel?.();
  };

  if (!editing) {
    return (
      <Box onClick={() => setEditing(true)} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
        {renderDisplay(value)}
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {renderEdit(editValue, setEditValue, handleSave, handleCancel)}
    </Stack>
  );
}

export default function TaskDetailPage() {
  const { taskId, id } = useParams();
  const resolveId = taskId || id;
  const theme = useTheme();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [titleValue, setTitleValue] = useState('');

  const [descEditing, setDescEditing] = useState(false);
  const [descValue, setDescValue] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commentEditId, setCommentEditId] = useState(null);
  const [commentEditValue, setCommentEditValue] = useState('');

  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const [showAssigneeSelect, setShowAssigneeSelect] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { getTask, getTaskComments, getTaskHistory } = await import('../../api/taskApi');
      const { getEmployees } = await import('../../api/companyApi');

      const [taskRes, commentRes, historyRes, projectRes, empRes] = await Promise.all([
        getTask(resolveId),
        getTaskComments(resolveId),
        getTaskHistory(resolveId),
        getProjects({ limit: 100 }),
        getEmployees({ limit: 100 }),
      ]);

      setTask(taskRes.data?.data || taskRes.data);
      setComments(commentRes.data?.data || commentRes.data || []);
      setHistory(historyRes.data?.data || historyRes.data || []);
      setProjects(projectRes.data?.data || projectRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load task';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [resolveId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (task) {
      setTitleValue(task.title || '');
      setDescValue(task.description || '');
      if (task.checklist) setChecklistItems(task.checklist);
    }
  }, [task]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleUpdateField = async (field, value) => {
    if (!task) return;
    const prev = { ...task };
    setTask((t) => ({ ...t, [field]: value }));
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(resolveId, { [field]: value });
    } catch {
      setTask(prev);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleUpdateStatus = (newStatus) => handleUpdateField('status', newStatus);
  const handleUpdatePriority = (newPriority) => handleUpdateField('priority', newPriority);
  const handleUpdateTitle = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      handleUpdateField('title', titleValue.trim());
    }
    setTitleEditing(false);
  };
  const handleUpdateDescription = () => {
    if (descValue !== task.description) {
      handleUpdateField('description', descValue);
    }
    setDescEditing(false);
  };

  const handleDelete = async () => {
    try {
      const { deleteTask } = await import('../../api/taskApi');
      await deleteTask(resolveId);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to delete task');
    }
    setDeleteConfirm(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { createComment } = await import('../../api/taskApi');
      const res = await createComment(resolveId, { content: newComment });
      const created = res.data?.data || res.data;
      setComments((prev) => [...prev, created]);
      setNewComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!commentEditValue.trim()) return;
    try {
      const { updateTask } = await import('../../api/taskApi');
      await updateTask(resolveId, { commentId, content: commentEditValue });
      setComments((prev) => prev.map((c) =>
        (c._id || c.id) === commentId ? { ...c, content: commentEditValue } : c
      ));
      setCommentEditId(null);
      setCommentEditValue('');
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { deleteComment } = await import('../../api/taskApi');
      await deleteComment(resolveId, commentId);
      setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const item = { id: Date.now().toString(), text: newChecklistItem, completed: false };
    const updated = [...checklistItems, item];
    setChecklistItems(updated);
    setNewChecklistItem('');
    handleUpdateField('checklist', updated);
  };

  const handleToggleChecklist = (itemId) => {
    const updated = checklistItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
    handleUpdateField('checklist', updated);
  };

  const handleDeleteChecklist = (itemId) => {
    const updated = checklistItems.filter((item) => item.id !== itemId);
    setChecklistItems(updated);
    handleUpdateField('checklist', updated);
  };

  const handleEditChecklist = (itemId, text) => {
    const updated = checklistItems.map((item) =>
      item.id === itemId ? { ...item, text } : item
    );
    setChecklistItems(updated);
    handleUpdateField('checklist', updated);
  };

  const handleChecklistDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(checklistItems);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    setChecklistItems(items);
    handleUpdateField('checklist', items);
  };

  const handleTimerToggle = () => {
    if (timerRunning) {
      clearInterval(timerRef.current);
      const logged = task.loggedHours || 0;
      handleUpdateField('loggedHours', logged + timerSeconds / 3600);
      setTimerSeconds(0);
    } else {
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    setTimerRunning(!timerRunning);
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const allUserOptions = useMemo(() => employees.map((e) => {
    const name = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim();
    return { value: e._id || e.id, label: name, avatar: e.avatar };
  }), [employees]);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Task Detail" breadcrumbs={[{ label: 'Tasks', href: '/tasks' }, { label: 'Loading...' }]} />
        <ProfileSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Error" breadcrumbs={[{ label: 'Tasks', href: '/tasks' }, { label: 'Error' }]} />
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button variant="outlined" onClick={fetchData}>Retry</Button>
        </Box>
      </Box>
    );
  }

  if (!task) return null;

  const assignee = task.assignee || task.assigneeId;
  const assigneeName = assignee?.name || `${assignee?.firstName || ''} ${assignee?.lastName || ''}`.trim() || '';
  const reporter = task.reporter || task.createdBy;
  const reporterName = reporter?.name || `${reporter?.firstName || ''} ${reporter?.lastName || ''}`.trim() || '';
  const project = task.project || task.projectId;
  const projectName = project?.name || (typeof project === 'string' ? project : '');

  const completedChecklist = checklistItems.filter((i) => i.completed).length;
  const totalChecklist = checklistItems.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <PageHeader
          title=""
          breadcrumbs={[
            { label: 'Tasks', href: '/tasks' },
            { label: task.taskId || `TASK-${(task._id || task.id || '').slice(-6)}` },
          ]}
        />
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontWeight={600}>
                  {task.taskId || `TASK-${(task._id || task.id || '').slice(-6)}`}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select
                    value={task.status || 'todo'}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    sx={{
                      fontSize: '0.8rem', height: 30,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.3) },
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${s.color}.main` }} />
                          <Typography variant="body2">{s.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={task.priority || 'medium'}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    sx={{
                      fontSize: '0.8rem', height: 30,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.divider, 0.3) },
                    }}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        <PriorityBadge priority={p.value} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {projectName && (
                  <Chip label={projectName} size="small" variant="filled" color="primary" sx={{ fontWeight: 500 }} />
                )}
              </Stack>

              <EditableField
                value={titleValue}
                onSave={handleUpdateTitle}
                renderDisplay={(v) => (
                  <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                    <Typography variant="h4" fontWeight={700}>{v}</Typography>
                  </Box>
                )}
                renderEdit={(v, setV, save, cancel) => (
                  <>
                    <TextField
                      value={v}
                      onChange={(e) => setV(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                      sx={{ '& input': { fontSize: '1.5rem', fontWeight: 700 } }}
                    />
                    <IconButton size="small" color="primary" onClick={save}><CheckIcon /></IconButton>
                    <IconButton size="small" onClick={cancel}><CloseIcon /></IconButton>
                  </>
                )}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Description
              </Typography>
              {!descEditing ? (
                <Box
                  onClick={() => setDescEditing(true)}
                  sx={{
                    p: 2, borderRadius: 2, border: '1px solid',
                    borderColor: 'transparent',
                    cursor: 'pointer',
                    '&:hover': { borderColor: alpha(theme.palette.divider, 0.2), bgcolor: alpha(theme.palette.action.hover, 0.3) },
                  }}
                >
                  {task.description ? (
                    <div dangerouslySetInnerHTML={{ __html: task.description }} />
                  ) : (
                    <Typography variant="body2" color="text.disabled">Add a description...</Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  <RichTextEditor value={descValue} onChange={setDescValue} height={200} />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button variant="contained" size="small" onClick={handleUpdateDescription}>Save</Button>
                    <Button variant="outlined" size="small" onClick={() => { setDescEditing(false); setDescValue(task.description || ''); }}>Cancel</Button>
                  </Stack>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Checklist */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Checklist
                </Typography>
                {totalChecklist > 0 && (
                  <Chip
                    label={`${completedChecklist}/${totalChecklist}`}
                    size="small"
                    variant="outlined"
                    color={completedChecklist === totalChecklist ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {totalChecklist > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={(completedChecklist / totalChecklist) * 100}
                    sx={{ flex: 1, maxWidth: 120, height: 4, borderRadius: 2 }}
                  />
                )}
              </Stack>

              <DragDropContext onDragEnd={handleChecklistDragEnd}>
                <Droppable droppableId="checklist">
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                      {checklistItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1, py: 0.5,
                                '&:hover .checklist-actions': { opacity: 1 },
                              }}
                            >
                              <Box {...provided.dragHandleProps} sx={{ color: 'text.disabled', display: 'flex', cursor: 'grab' }}>
                                <DragIndicatorIcon fontSize="small" />
                              </Box>
                              <Checkbox
                                checked={item.completed}
                                onChange={() => handleToggleChecklist(item.id)}
                                size="small"
                                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 18, color: alpha(theme.palette.text.secondary, 0.3) }} />}
                                checkedIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 18, color: 'success.main' }} />}
                              />
                              <ChecklistEditItem
                                value={item.text}
                                onSave={(text) => handleEditChecklist(item.id, text)}
                                completed={item.completed}
                              />
                              <Box className="checklist-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                                <IconButton size="small" onClick={() => handleDeleteChecklist(item.id)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); }}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                />
                <IconButton size="small" color="primary" onClick={handleAddChecklistItem}>
                  <AddIcon />
                </IconButton>
              </Stack>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Comments */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Comments ({comments.length})
              </Typography>

              <Box sx={{ mb: 2 }}>
                <RichTextEditor value={newComment} onChange={setNewComment} height={120} />
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </Button>
                </Stack>
              </Box>

              {comments.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                  No comments yet
                </Typography>
              ) : (
                comments.map((comment) => {
                  const commentAuthor = comment.author || comment.user || comment.createdBy;
                  const authorName = commentAuthor?.name || `${commentAuthor?.firstName || ''} ${commentAuthor?.lastName || ''}`.trim() || 'User';
                  const isEditing = commentEditId === (comment._id || comment.id);
                  return (
                    <Box key={comment._id || comment.id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Avatar src={commentAuthor?.avatar} sx={{ width: 32, height: 32, fontSize: 12, bgcolor: generateAvatarColor(authorName) }}>
                          {getInitials(authorName)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{authorName}</Typography>
                            <Typography variant="caption" color="text.disabled">
                              {formatRelativeTime(comment.createdAt)}
                            </Typography>
                          </Stack>
                          {isEditing ? (
                            <Box>
                              <RichTextEditor value={commentEditValue} onChange={setCommentEditValue} height={100} />
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Button size="small" variant="contained" onClick={() => handleEditComment(comment._id || comment.id)}>Save</Button>
                                <Button size="small" onClick={() => setCommentEditId(null)}>Cancel</Button>
                              </Stack>
                            </Box>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: comment.content || comment.text }} />
                          )}
                          {!isEditing && (
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => { setCommentEditId(comment._id || comment.id); setCommentEditValue(comment.content || comment.text || ''); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDeleteComment(comment._id || comment.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Activity History */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Activity
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                  No activity yet
                </Typography>
              ) : (
                history.map((entry, idx) => {
                  const entryUser = entry.user || entry.actor || entry.createdBy;
                  const entryName = entryUser?.name || `${entryUser?.firstName || ''} ${entryUser?.lastName || ''}`.trim() || 'System';
                  return (
                    <Box key={entry._id || entry.id || idx} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
                      <Avatar src={entryUser?.avatar} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: generateAvatarColor(entryName) }}>
                        {getInitials(entryName)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          <Typography component="span" fontWeight={600} variant="body2">{entryName}</Typography>{' '}
                          {entry.action || entry.type || 'updated'}{' '}
                          {entry.field && (
                            <Typography component="span" variant="body2" color="text.secondary">
                              {entry.field}{' '}
                            </Typography>
                          )}
                          {entry.fromValue && entry.toValue && (
                            <Typography component="span" variant="body2" color="text.secondary">
                              from <StatusBadge status={entry.fromValue} statusMap={TASK_STATUS} size="small" /> to <StatusBadge status={entry.toValue} statusMap={TASK_STATUS} size="small" />
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatRelativeTime(entry.createdAt || entry.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </motion.div>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              {/* Assignee */}
              <SidebarRow icon={<PersonIcon />} label="Assignee">
                {assigneeName ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={assignee?.avatar} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: generateAvatarColor(assigneeName) }}>
                      {getInitials(assigneeName)}
                    </Avatar>
                    <Typography variant="body2">{assigneeName}</Typography>
                  </Stack>
                ) : (
                  <Button size="small" variant="text" onClick={() => setShowAssigneeSelect(true)} sx={{ textTransform: 'none' }}>
                    Unassigned
                  </Button>
                )}
              </SidebarRow>

              {/* Reporter */}
              <SidebarRow icon={<PersonIcon />} label="Reporter">
                {reporterName ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={reporter?.avatar} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: generateAvatarColor(reporterName) }}>
                      {getInitials(reporterName)}
                    </Avatar>
                    <Typography variant="body2">{reporterName}</Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.disabled">-</Typography>
                )}
              </SidebarRow>

              {/* Labels */}
              <SidebarRow icon={<LabelIcon />} label="Labels">
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {task.labels?.map((label) => (
                    <Chip key={label} label={label} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  ))}
                  <Chip label="+ Add" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem', cursor: 'pointer', borderStyle: 'dashed' }} />
                </Stack>
              </SidebarRow>

              {/* Story Points */}
              <SidebarRow icon={<AccessTimeIcon />} label="Story Points">
                <TextField
                  type="number"
                  size="small"
                  value={task.storyPoints || ''}
                  onChange={(e) => handleUpdateField('storyPoints', Number(e.target.value))}
                  sx={{ width: 80 }}
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '0.875rem' } }}
                />
              </SidebarRow>

              {/* Due Date */}
              <SidebarRow icon={<CalendarTodayIcon />} label="Due Date">
                <TextField
                  type="date"
                  size="small"
                  value={task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : ''}
                  onChange={(e) => handleUpdateField('dueDate', e.target.value || null)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& input': { fontSize: '0.875rem' } }}
                />
              </SidebarRow>

              <Divider sx={{ my: 1.5 }} />

              {/* Time Tracking */}
              <SidebarRow icon={<AccessTimeIcon />} label="Time Tracking">
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {task.loggedHours || 0}h logged
                    </Typography>
                    {task.estimatedHours && (
                      <Typography variant="caption" color="text.secondary">
                        / {task.estimatedHours}h estimated
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" fontFamily="monospace" color={timerRunning ? 'success.main' : 'text.secondary'}>
                      {formatTimer(timerSeconds)}
                    </Typography>
                    <IconButton
                      size="small"
                      color={timerRunning ? 'error' : 'primary'}
                      onClick={handleTimerToggle}
                      sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}
                    >
                      {timerRunning ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                    </IconButton>
                  </Stack>
                </Box>
              </SidebarRow>

              <Divider sx={{ my: 1.5 }} />

              {/* Dependencies */}
              <SidebarRow icon={<BlockIcon />} label="Dependencies">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Blocked by
                  </Typography>
                  {task.dependsOn?.length ? task.dependsOn.map((dep) => (
                    <Chip key={dep._id || dep.id} label={dep.title || dep.taskId} size="small" variant="outlined" sx={{ mb: 0.5, fontSize: '0.7rem' }} />
                  )) : (
                    <Typography variant="caption" color="text.disabled">None</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
                    Blocks
                  </Typography>
                  {task.blocking?.length ? task.blocking.map((dep) => (
                    <Chip key={dep._id || dep.id} label={dep.title || dep.taskId} size="small" variant="outlined" sx={{ mb: 0.5, fontSize: '0.7rem' }} />
                  )) : (
                    <Typography variant="caption" color="text.disabled">None</Typography>
                  )}
                </Box>
              </SidebarRow>

              <Divider sx={{ my: 1.5 }} />

              {/* Attachments */}
              <SidebarRow icon={<AttachFileIcon />} label="Attachments">
                <Box>
                  {task.attachments?.map((att) => (
                    <Stack key={att._id || att.id} direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                      <Typography variant="caption" noWrap sx={{ flex: 1 }}>{att.name || att.filename}</Typography>
                      <IconButton size="small" href={att.url || att.path} download><DownloadIcon fontSize="small" /></IconButton>
                    </Stack>
                  ))}
                  <FileUpload
                    multiple
                    onFilesChange={(files) => {
                      if (files?.length) handleUpdateField('attachments', [...(task.attachments || []), ...files]);
                    }}
                  />
                </Box>
              </SidebarRow>

              <Divider sx={{ my: 1.5 }} />

              {/* Details */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Created {formatDateTime(task.createdAt)}
                </Typography>
                {projectName && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Project: {projectName}
                  </Typography>
                )}
                {task.sprint && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Sprint: {task.sprint.name || task.sprint}
                  </Typography>
                )}
                {task.epic && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Epic: {task.epic.name || task.epic}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteConfirm(task)}
                >
                  Delete Task
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Assignee Select Dialog */}
      <Dialog open={showAssigneeSelect} onClose={() => setShowAssigneeSelect(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Assignee</DialogTitle>
        <DialogContent>
          <Stack spacing={0.5}>
            <MenuItem onClick={() => { handleUpdateField('assigneeId', null); setShowAssigneeSelect(false); }} dense>
              <Typography variant="body2">Unassigned</Typography>
            </MenuItem>
            {allUserOptions.map((u) => (
              <MenuItem
                key={u.value}
                onClick={() => { handleUpdateField('assigneeId', u.value); setShowAssigneeSelect(false); }}
                dense
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={u.avatar} sx={{ width: 24, height: 24, fontSize: 10 }}>{getInitials(u.label)}</Avatar>
                  <Typography variant="body2">{u.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </motion.div>
  );
}

function SidebarRow({ icon, label, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: 'text.secondary', mt: 0.3, display: 'flex' }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </Typography>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}

function ChecklistEditItem({ value, onSave, completed }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => {
    if (val.trim() && val !== value) onSave(val.trim());
    setEditing(false);
  };

  if (!editing) {
    return (
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          textDecoration: completed ? 'line-through' : 'none',
          color: completed ? 'text.disabled' : 'text.primary',
          cursor: 'pointer',
          py: 0.5,
        }}
        onClick={() => !completed && setEditing(true)}
      >
        {value}
      </Typography>
    );
  }

  return (
    <TextField
      size="small"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setVal(value); } }}
      onBlur={handleSave}
      autoFocus
      sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
    />
  );
}