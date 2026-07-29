import React, { useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { logoutStart } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/uiSlice';
import { useThemeMode } from '../context/ThemeContext';
import { getInitials, generateAvatarColor } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';

export default function Header({ onMenuToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark, toggleTheme: toggleThemeMode } = useThemeMode();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleNotifMenu = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const handleThemeToggle = () => {
    toggleThemeMode();
    dispatch(toggleTheme());
  };

  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const avatarUrl = user?.avatar || user?.profilePicture;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuToggle} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        {!isMobile && (
          <Box sx={{ width: 320, mr: 2 }}>
            <SearchInput placeholder="Search projects, tasks, people..." />
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Theme Toggle */}
        <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={handleThemeToggle} sx={{ mr: 1 }}>
            {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={handleNotifMenu} sx={{ mr: 1 }}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchorEl}
          open={notifOpen}
          onClose={handleNotifMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { width: 360, maxHeight: 480 } }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => { navigate('/notifications'); handleNotifMenuClose(); }}
            >
              View all
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        </Menu>

        {/* User Menu */}
        <Tooltip title="Account">
          <IconButton onClick={handleProfileMenu} size="small">
            <Avatar
              src={avatarUrl}
              sx={{
                width: 34,
                height: 34,
                bgcolor: avatarUrl ? 'transparent' : generateAvatarColor(userName),
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {!avatarUrl && getInitials(userName)}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { minWidth: 200 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { dispatch(logoutStart()); handleProfileMenuClose(); }}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
