import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
  [{ color: [] }, { background: [] }],
  ['link', 'image', 'video'],
  ['blockquote', 'code-block'],
  [{ align: [] }],
  ['clean'],
];

export default function RichTextEditor({ value, onChange, placeholder = 'Write something...', height = 300, readOnly = false }) {
  const modules = useMemo(
    () => ({
      toolbar: readOnly ? false : TOOLBAR_OPTIONS,
      clipboard: { matchVisual: false },
    }),
    [readOnly]
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'align',
  ];

  return (
    <Box
      sx={{
        '& .ql-container': {
          minHeight: height,
          fontSize: '14px',
          fontFamily: 'inherit',
        },
        '& .ql-editor': {
          minHeight: height,
        },
        '& .ql-toolbar': {
          borderRadius: '8px 8px 0 0',
          borderColor: 'divider',
        },
        '& .ql-container': {
          borderRadius: '0 0 8px 8px',
          borderColor: 'divider',
        },
      }}
    >
      <ReactQuill
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        theme="snow"
      />
    </Box>
  );
}
