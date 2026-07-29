import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Avatar, IconButton,
  TextField, InputAdornment, Badge, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemButton, ListItemAvatar, ListItemText, alpha, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Johnson', avatar: '', online: true, lastSeen: null },
  { id: 'u2', name: 'Bob Smith', avatar: '', online: true, lastSeen: null },
  { id: 'u3', name: 'Carol Davis', avatar: '', online: false, lastSeen: '2026-07-28T14:30:00' },
  { id: 'u4', name: 'David Wilson', avatar: '', online: false, lastSeen: '2026-07-27T10:00:00' },
  { id: 'u5', name: 'Eve Martin', avatar: '', online: true, lastSeen: null },
  { id: 'u6', name: 'Frank Brown', avatar: '', online: false, lastSeen: '2026-07-26T16:45:00' },
];

const CURRENT_USER = { id: 'u1', name: 'Alice Johnson' };

const MOCK_CONVERSATIONS = [
  {
    id: 'c1', name: 'Bob Smith', isGroup: false, participants: ['u1', 'u2'],
    lastMessage: { text: 'Sure, I will review the PR today', sender: 'u2', time: '2026-07-28T14:30:00' },
    unread: 2, online: true,
  },
  {
    id: 'c2', name: 'Design Team', isGroup: true, participants: ['u1', 'u2', 'u3', 'u5'],
    lastMessage: { text: 'New mockups are ready for review', sender: 'u3', time: '2026-07-28T13:15:00' },
    unread: 0, online: false,
  },
  {
    id: 'c3', name: 'Carol Davis', isGroup: false, participants: ['u1', 'u3'],
    lastMessage: { text: 'Thanks for the update!', sender: 'u1', time: '2026-07-27T16:00:00' },
    unread: 0, online: false,
  },
  {
    id: 'c4', name: 'Project Alpha', isGroup: true, participants: ['u1', 'u2', 'u4', 'u5', 'u6'],
    lastMessage: { text: 'Meeting tomorrow at 10 AM', sender: 'u4', time: '2026-07-27T11:00:00' },
    unread: 5, online: false,
  },
];

const MOCK_MESSAGES = {
  c1: [
    { id: 'm1', sender: 'u2', text: 'Hey, can you review my PR?', time: '2026-07-28T14:00:00' },
    { id: 'm2', sender: 'u1', text: 'Sure, send me the link', time: '2026-07-28T14:05:00' },
    { id: 'm3', sender: 'u2', text: 'Here it is: https://github.com/pr/123', time: '2026-07-28T14:10:00' },
    { id: 'm4', sender: 'u2', text: 'Its mainly the dashboard components', time: '2026-07-28T14:15:00' },
    { id: 'm5', sender: 'u1', text: 'I will take a look now', time: '2026-07-28T14:20:00' },
    { id: 'm6', sender: 'u2', text: 'Sure, I will review the PR today', time: '2026-07-28T14:30:00' },
  ],
  c2: [
    { id: 'm7', sender: 'u3', text: 'New mockups are ready for review', time: '2026-07-28T13:15:00' },
    { id: 'm8', sender: 'u5', text: 'They look great!', time: '2026-07-28T13:20:00' },
  ],
};

function getOtherParticipant(conversation) {
  const other = conversation.participants.find((p) => p !== CURRENT_USER.id);
  return MOCK_USERS.find((u) => u.id === other);
}

function formatMessageTime(date) {
  const msgDate = dayjs(date);
  const today = dayjs();
  if (msgDate.isSame(today, 'day')) return msgDate.format('h:mm A');
  if (msgDate.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  return msgDate.format('MMM DD');
}

function shouldShowDateSeparator(messages, idx) {
  if (idx === 0) return true;
  const curr = dayjs(messages[idx].time);
  const prev = dayjs(messages[idx - 1].time);
  return !curr.isSame(prev, 'day');
}

export default function ChatPage() {
  const theme = useTheme();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const conversations = useMemo(() => {
    if (!search) return MOCK_CONVERSATIONS;
    return MOCK_CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const messages = selectedConversation ? MOCK_MESSAGES[selectedConversation.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };

  const getParticipantName = (senderId) => {
    if (senderId === CURRENT_USER.id) return 'You';
    const user = MOCK_USERS.find((u) => u.id === senderId);
    return user?.name || 'Unknown';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 'calc(100vh - 170px)' }}>
      <PageHeader title="Chat" subtitle="Team communication" breadcrumbs={[{ label: 'Chat' }]} />

      <Card sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ width: 320, borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                size="small" fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }}
              />
              <IconButton size="small" color="primary" onClick={() => setNewChatOpen(true)}>
                <AddCommentIcon />
              </IconButton>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List disablePadding>
              {conversations.map((conv) => {
                const otherUser = conv.isGroup ? null : getOtherParticipant(conv);
                return (
                  <ListItemButton
                    key={conv.id}
                    selected={selectedConversation?.id === conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={conv.online ? <CircleIcon sx={{ fontSize: 12, color: '#22c55e' }} /> : null}
                      >
                        <Avatar
                          src={otherUser?.avatar}
                          sx={{ bgcolor: generateAvatarColor(conv.name), width: 44, height: 44, fontSize: 16 }}
                        >
                          {getInitials(conv.name)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conv.name}
                      secondary={conv.lastMessage.text}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600, noWrap: true }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true, color: 'text.secondary' }}
                    />
                    <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 1 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', fontSize: '0.6rem' }}>
                        {formatMessageTime(conv.lastMessage.time)}
                      </Typography>
                      {conv.unread > 0 && (
                        <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                          {conv.unread}
                        </Box>
                      )}
                    </Stack>
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Box>

        {selectedConversation ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton size="small" sx={{ display: { md: 'none' } }}><ArrowBackIcon /></IconButton>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={selectedConversation.online ? <CircleIcon sx={{ fontSize: 12, color: '#22c55e' }} /> : null}
              >
                <Avatar src={''} sx={{ bgcolor: generateAvatarColor(selectedConversation.name), width: 40, height: 40, fontSize: 14 }}>
                  {getInitials(selectedConversation.name)}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{selectedConversation.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConversation.isGroup
                    ? `${selectedConversation.participants.length} members`
                    : selectedConversation.online ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {messages.map((msg, idx) => {
                const isMe = msg.sender === CURRENT_USER.id;
                const showDate = shouldShowDateSeparator(messages, idx);
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 1 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                          {dayjs(msg.time).format('MMM DD, YYYY')}
                        </Typography>
                        <Divider sx={{ flex: 1 }} />
                      </Stack>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <Box sx={{ maxWidth: '70%' }}>
                        {selectedConversation.isGroup && !isMe && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.25, display: 'block' }}>
                            {getParticipantName(msg.sender)}
                          </Typography>
                        )}
                        <Box
                          sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: isMe ? theme.palette.primary.main : alpha(theme.palette.action.hover, 0.5),
                            color: isMe ? 'white' : 'text.primary',
                            borderTopRightRadius: isMe ? 4 : 2,
                            borderTopLeftRadius: isMe ? 2 : 4,
                          }}
                        >
                          <Typography variant="body2">{msg.text}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.25, opacity: 0.7, fontSize: '0.6rem' }}>
                            {dayjs(msg.time).format('h:mm A')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small"><AttachFileIcon /></IconButton>
                <IconButton size="small"><InsertEmoticonIcon /></IconButton>
                <TextField
                  value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  size="small" fullWidth
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!messageInput.trim()}>
                  <SendIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              icon={<AddCommentIcon sx={{ fontSize: 64 }} />}
              title="Select a conversation"
              description="Choose a conversation from the left panel to start chatting"
            />
          </Box>
        )}
      </Card>

      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Search users" fullWidth sx={{ mt: 1 }} />
          <List dense sx={{ mt: 1 }}>
            {MOCK_USERS.filter((u) => u.id !== CURRENT_USER.id).map((user) => (
              <ListItemButton key={user.id} onClick={() => { setNewChatOpen(false); }}>
                <ListItemAvatar>
                  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={user.online ? <CircleIcon sx={{ fontSize: 12, color: '#22c55e' }} /> : null}>
                    <Avatar src={user.avatar} sx={{ bgcolor: generateAvatarColor(user.name) }}>{getInitials(user.name)}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
