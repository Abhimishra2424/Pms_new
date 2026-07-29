import React, { useCallback, useState } from 'react';
import { Box, Typography, IconButton, LinearProgress, Chip, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useDropzone } from 'react-dropzone';
import { formatBytes } from '../../utils/helpers';
import { FILE_UPLOAD } from '../../constants/config';

export default function FileUpload({
  onFilesChange,
  multiple = true,
  accept,
  maxSize = FILE_UPLOAD.MAX_FILE_SIZE,
  maxFiles = FILE_UPLOAD.MAX_FILE_COUNT,
  disabled = false,
  files: externalFiles,
}) {
  const [internalFiles, setInternalFiles] = useState([]);
  const isControlled = externalFiles !== undefined;
  const files = isControlled ? externalFiles : internalFiles;

  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
        })
      );
      const updated = multiple ? [...files, ...newFiles].slice(0, maxFiles) : newFiles.slice(0, 1);
      if (isControlled) {
        onFilesChange?.(updated);
      } else {
        setInternalFiles(updated);
        onFilesChange?.(updated);
      }
    },
    [files, multiple, maxFiles, isControlled, onFilesChange]
  );

  const removeFile = (fileId) => {
    const updated = files.filter((f) => f.id !== fileId);
    if (isControlled) {
      onFilesChange?.(updated);
    } else {
      setInternalFiles(updated);
      onFilesChange?.(updated);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'image/*': [],
      'application/pdf': [],
      ...FILE_UPLOAD.ACCEPTED_DOCUMENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    },
    maxSize,
    maxFiles,
    multiple,
    disabled,
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Max {formatBytes(maxSize)} per file, up to {maxFiles} files
        </Typography>
      </Box>
      {files.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {files.map((file) => (
            <Box
              key={file.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              {file.preview ? (
                <Box
                  component="img"
                  src={file.preview}
                  sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                />
              ) : (
                <InsertDriveFileIcon color="action" />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatBytes(file.size)}
                </Typography>
                {file.progress > 0 && file.progress < 100 && (
                  <LinearProgress variant="determinate" value={file.progress} sx={{ mt: 0.5 }} />
                )}
              </Box>
              <IconButton size="small" onClick={() => removeFile(file.id)} disabled={disabled}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
