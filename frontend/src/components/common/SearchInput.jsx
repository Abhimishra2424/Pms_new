import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from '../../utils/helpers';

export default function SearchInput({
  value: externalValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  fullWidth = true,
  size = 'small',
  ...props
}) {
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const isControlled = externalValue !== undefined;

  const debouncedOnChange = useCallback(
    debounce((val) => {
      onChange?.(val);
    }, debounceMs),
    [onChange, debounceMs]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    if (isControlled) {
      onChange?.(val);
    } else {
      setInternalValue(val);
      debouncedOnChange(val);
    }
  };

  const handleClear = () => {
    if (isControlled) {
      onChange?.('');
    } else {
      setInternalValue('');
      debouncedOnChange('');
    }
  };

  const value = isControlled ? externalValue : internalValue;

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      size={size}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
}
