import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = sidebarCollapsed && !isMobile ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${sidebarWidth}px` },
          transition: 'margin-left 0.3s ease',
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            textAlign: 'center',
            color: 'text.disabled',
            fontSize: '0.75rem',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          &copy; {new Date().getFullYear()} ProjectPro. All rights reserved.
        </Box>
      </Box>
    </Box>
  );
}
