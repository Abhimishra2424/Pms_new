import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function FilterDrawer({
  open,
  onClose,
  onApply,
  onReset,
  children,
  title = 'Filters',
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={2.5}>
            {children}
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            fullWidth
          >
            Reset
          </Button>
          <Button variant="contained" onClick={onApply} fullWidth>
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export function FilterTextField({ label, ...props }) {
  return (
    <FormControl fullWidth size="small">
      <TextField label={label} size="small" {...props} />
    </FormControl>
  );
}

export function FilterSelect({ label, options, value, onChange, ...props }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={onChange} label={label} {...props}>
        <MenuItem value="">All</MenuItem>
        {options?.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function FilterDateRange({ startLabel, endLabel, startValue, endValue, onStartChange, onEndChange }) {
  return (
    <Stack direction="row" spacing={1}>
      <TextField
        label={startLabel || 'Start Date'}
        type="date"
        size="small"
        value={startValue || ''}
        onChange={onStartChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label={endLabel || 'End Date'}
        type="date"
        size="small"
        value={endValue || ''}
        onChange={onEndChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
    </Stack>
  );
}

export function FilterMultiSelect({ label, options, value = [], onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={onChange}
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => {
              const opt = options?.find((o) => o.value === val);
              return <Chip key={val} label={opt?.label || val} size="small" />;
            })}
          </Box>
        )}
      >
        {options?.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
