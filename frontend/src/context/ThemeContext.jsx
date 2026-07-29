import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

const lightPalette = {
  primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
  secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
  success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
  warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
  error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' },
  info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b' },
  background: { default: '#f5f5f5', paper: '#ffffff' },
  text: { primary: '#1a1a2e', secondary: '#555770', disabled: '#9e9e9e' },
  divider: 'rgba(0, 0, 0, 0.08)',
};

const darkPalette = {
  primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
  secondary: { main: '#ce93d8', light: '#f3e5f5', dark: '#ab47bc' },
  success: { main: '#66bb6a', light: '#a5d6a7', dark: '#388e3c' },
  warning: { main: '#ffa726', light: '#ffcc80', dark: '#f57c00' },
  error: { main: '#ef5350', light: '#ef9a9a', dark: '#d32f2f' },
  info: { main: '#29b6f6', light: '#81d4fa', dark: '#0288d1' },
  background: { default: '#1a1a2e', paper: '#16213e' },
  text: { primary: '#e8e8e8', secondary: '#a0a0b8', disabled: '#666680' },
  divider: 'rgba(255, 255, 255, 0.08)',
};

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light' ? lightPalette : darkPalette),
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.45 },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.5 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8rem', lineHeight: 1.6 },
    button: { fontWeight: 600, fontSize: '0.85rem', textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: { fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: mode === 'light' ? [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 5px rgba(0,0,0,0.08)',
    '0px 1px 8px rgba(0,0,0,0.08)',
    '0px 2px 10px rgba(0,0,0,0.08)',
    '0px 2px 12px rgba(0,0,0,0.08)',
    '0px 3px 14px rgba(0,0,0,0.08)',
    '0px 3px 16px rgba(0,0,0,0.08)',
    '0px 4px 18px rgba(0,0,0,0.08)',
    '0px 4px 20px rgba(0,0,0,0.08)',
    '0px 5px 22px rgba(0,0,0,0.08)',
    '0px 5px 24px rgba(0,0,0,0.08)',
    '0px 6px 26px rgba(0,0,0,0.08)',
    '0px 6px 28px rgba(0,0,0,0.08)',
    '0px 7px 30px rgba(0,0,0,0.08)',
    '0px 7px 32px rgba(0,0,0,0.08)',
    '0px 8px 34px rgba(0,0,0,0.08)',
    '0px 8px 36px rgba(0,0,0,0.08)',
    '0px 9px 38px rgba(0,0,0,0.08)',
    '0px 9px 40px rgba(0,0,0,0.08)',
    '0px 10px 42px rgba(0,0,0,0.08)',
    '0px 10px 44px rgba(0,0,0,0.08)',
    '0px 11px 46px rgba(0,0,0,0.08)',
    '0px 11px 48px rgba(0,0,0,0.08)',
    '0px 12px 50px rgba(0,0,0,0.08)',
  ] : [
    'none',
    '0px 1px 3px rgba(0,0,0,0.3)',
    '0px 1px 5px rgba(0,0,0,0.3)',
    '0px 1px 8px rgba(0,0,0,0.3)',
    '0px 2px 10px rgba(0,0,0,0.3)',
    '0px 2px 12px rgba(0,0,0,0.3)',
    '0px 3px 14px rgba(0,0,0,0.3)',
    '0px 3px 16px rgba(0,0,0,0.3)',
    '0px 4px 18px rgba(0,0,0,0.3)',
    '0px 4px 20px rgba(0,0,0,0.3)',
    '0px 5px 22px rgba(0,0,0,0.3)',
    '0px 5px 24px rgba(0,0,0,0.3)',
    '0px 6px 26px rgba(0,0,0,0.3)',
    '0px 6px 28px rgba(0,0,0,0.3)',
    '0px 7px 30px rgba(0,0,0,0.3)',
    '0px 7px 32px rgba(0,0,0,0.3)',
    '0px 8px 34px rgba(0,0,0,0.3)',
    '0px 8px 36px rgba(0,0,0,0.3)',
    '0px 9px 38px rgba(0,0,0,0.3)',
    '0px 9px 40px rgba(0,0,0,0.3)',
    '0px 10px 42px rgba(0,0,0,0.3)',
    '0px 10px 44px rgba(0,0,0,0.3)',
    '0px 11px 46px rgba(0,0,0,0.3)',
    '0px 11px 48px rgba(0,0,0,0.3)',
    '0px 12px 50px rgba(0,0,0,0.3)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 2px 8px rgba(0,0,0,0.15)' },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' ? '0px 1px 3px rgba(0,0,0,0.08)' : '0px 1px 3px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': { paddingBottom: '20px' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#1a1a2e',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0px 1px 3px rgba(0,0,0,0.08)' : '0px 1px 3px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved || 'light';
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('app_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const value = useMemo(() => ({
    theme: mode,
    toggleTheme,
    isDark: mode === 'dark',
  }), [mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
