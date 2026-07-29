import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { toggleSidebarCollapsed } from '../redux/slices/uiSlice';
import { logoutStart } from '../redux/slices/authSlice';
import { getInitials, generateAvatarColor } from '../utils/helpers';
import { APP_NAME } from '../constants/config';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CelebrationIcon from '@mui/icons-material/Celebration';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookIcon from '@mui/icons-material/Book';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 68;

const navigationItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ],
  },
  {
    section: 'Projects',
    items: [
      { label: 'Projects', icon: <FolderIcon />, path: '/projects' },
      { label: 'My Tasks', icon: <TaskIcon />, path: '/my-tasks' },
      { label: 'All Tasks', icon: <TaskIcon />, path: '/tasks' },
    ],
  },
  {
    section: 'Company',
    items: [
      { label: 'Employees', icon: <PeopleIcon />, path: '/company/employees' },
      { label: 'Departments', icon: <BusinessIcon />, path: '/company/departments' },
      { label: 'Designations', icon: <WorkIcon />, path: '/company/designations' },
      { label: 'Settings', icon: <SettingsIcon />, path: '/company/settings' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Attendance', icon: <CalendarTodayIcon />, path: '/attendance' },
      { label: 'Leaves', icon: <EventBusyIcon />, path: '/leaves' },
      { label: 'Holidays', icon: <CelebrationIcon />, path: '/holidays' },
      { label: 'Meetings', icon: <MeetingRoomIcon />, path: '/meetings' },
    ],
  },
  {
    section: 'CRM & Finance',
    items: [
      { label: 'Clients', icon: <GroupIcon />, path: '/clients' },
      { label: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
      { label: 'Expenses', icon: <AccountBalanceWalletIcon />, path: '/expenses' },
    ],
  },
  {
    section: 'Knowledge',
    items: [
      { label: 'Documents', icon: <DescriptionIcon />, path: '/documents' },
      { label: 'Knowledge Base', icon: <MenuBookIcon />, path: '/knowledge-base' },
      { label: 'Wiki', icon: <BookIcon />, path: '/wiki' },
      { label: 'Announcements', icon: <CampaignIcon />, path: '/announcements' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Chat', icon: <ChatIcon />, path: '/chat' },
      { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    ],
  },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const [expandedSections, setExpandedSections] = React.useState({});

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onMobileClose();
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
          px: sidebarCollapsed && !isMobile ? 1 : 2,
          py: 1.5,
          minHeight: 64,
        }}
      >
        {(!sidebarCollapsed || isMobile) && (
          <Typography variant="h6" fontWeight={800} color="primary.main" noWrap>
            {APP_NAME}
          </Typography>
        )}
        {!isMobile && (
          <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <Box
              component="span"
              sx={{
                display: 'flex',
                cursor: 'pointer',
                color: 'text.secondary',
                transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s',
              }}
              onClick={() => dispatch(toggleSidebarCollapsed())}
            >
              <ChevronLeftIcon />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {navigationItems.map((section) => {
          if (section.section === 'Admin' && !isAdmin) return null;
          const isSectionActive = section.items.some((item) => isActive(item.path));
          const isExpanded = expandedSections[section.section] !== undefined
            ? expandedSections[section.section]
            : isSectionActive;

          return (
            <Box key={section.section}>
              {(!sidebarCollapsed || isMobile) && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 2.5,
                    py: 1,
                    display: 'block',
                    color: 'text.disabled',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: '0.65rem',
                  }}
                >
                  {section.section}
                </Typography>
              )}
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Tooltip key={item.label} title={sidebarCollapsed && !isMobile ? item.label : ''} placement="right">
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        selected={active}
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          minHeight: 44,
                          mx: 1,
                          borderRadius: 1.5,
                          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'initial',
                          px: sidebarCollapsed && !isMobile ? 1 : 2,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                            justifyContent: 'center',
                            color: active ? 'inherit' : 'text.secondary',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {(!sidebarCollapsed || isMobile) && (
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active ? 600 : 400 }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Divider />

      {/* User Info & Logout */}
      <Box sx={{ p: sidebarCollapsed && !isMobile ? 1 : 2 }}>
        {(!sidebarCollapsed || isMobile) && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              src={user.avatar || user.profilePicture}
              sx={{
                width: 36,
                height: 36,
                bgcolor: generateAvatarColor(user.name || user.email),
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {getInitials(user.name || `${user.firstName || ''} ${user.lastName || ''}`)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
              </Typography>
              <Typography variant="caption" color="text.disabled" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip title={sidebarCollapsed && !isMobile ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={() => dispatch(logoutStart())}
            sx={{
              borderRadius: 1.5,
              justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'initial',
              px: sidebarCollapsed && !isMobile ? 1 : 2,
              color: 'text.secondary',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {(!sidebarCollapsed || isMobile) && (
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}
