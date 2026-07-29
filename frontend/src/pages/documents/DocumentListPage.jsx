import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, IconButton, Tooltip,
  Breadcrumbs, Link, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Collapse, Drawer, alpha, useTheme,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableRowsIcon from '@mui/icons-material/TableRows';
import GridViewIcon from '@mui/icons-material/GridView';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import FileUpload from '../../components/common/FileUpload';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatBytes, formatRelativeTime } from '../../utils/helpers';

const FOLDER_STRUCTURE = [
  { id: 'root', name: 'Root', parent: null, type: 'folder' },
  { id: 'projects', name: 'Projects', parent: 'root', type: 'folder' },
  { id: 'hr', name: 'HR', parent: 'root', type: 'folder' },
  { id: 'finance', name: 'Finance', parent: 'root', type: 'folder' },
  { id: 'website', name: 'Website Redesign', parent: 'projects', type: 'folder' },
  { id: 'mobile', name: 'Mobile App', parent: 'projects', type: 'folder' },
  { id: 'contracts', name: 'Contracts', parent: 'hr', type: 'folder' },
  { id: 'invoices', name: 'Invoices', parent: 'finance', type: 'folder' },
];

const MOCK_FILES = [
  { id: 'f1', name: 'Project Proposal.pdf', type: 'pdf', size: 2500000, modifiedAt: '2026-07-28 14:30', folder: 'website', uploadedBy: 'Alice Johnson' },
  { id: 'f2', name: 'Design Mockup.png', type: 'image', size: 4500000, modifiedAt: '2026-07-27 10:15', folder: 'website', uploadedBy: 'Bob Smith' },
  { id: 'f3', name: 'Sprint Report.xlsx', type: 'sheet', size: 1200000, modifiedAt: '2026-07-26 16:00', folder: 'mobile', uploadedBy: 'Alice Johnson' },
  { id: 'f4', name: 'Meeting Notes.docx', type: 'doc', size: 800000, modifiedAt: '2026-07-25 09:45', folder: 'root', uploadedBy: 'Carol Davis' },
  { id: 'f5', name: 'Employee Handbook.pdf', type: 'pdf', size: 5200000, modifiedAt: '2026-07-20 11:00', folder: 'hr', uploadedBy: 'Admin' },
  { id: 'f6', name: 'Logo.svg', type: 'image', size: 250000, modifiedAt: '2026-07-18 15:30', folder: 'root', uploadedBy: 'Bob Smith' },
];

const FILE_ICONS = {
  pdf: <PictureAsPdfIcon sx={{ color: '#ef4444' }} />,
  image: <ImageIcon sx={{ color: '#22c55e' }} />,
  sheet: <DescriptionIcon sx={{ color: '#22c55e' }} />,
  doc: <DescriptionIcon sx={{ color: '#3b82f6' }} />,
  default: <InsertDriveFileIcon />,
};

function FolderTreeItem({ folder, folders, selectedFolder, onSelect, depth = 0 }) {
  const children = folders.filter((f) => f.parent === folder.id);
  const isSelected = selectedFolder === folder.id;
  const [expanded, setExpanded] = useState(depth < 1);

  return (
    <>
      <ListItem
        button
        selected={isSelected}
        onClick={() => { onSelect(folder.id); setExpanded(!expanded); }}
        sx={{ pl: 1 + depth * 2, borderRadius: 1, mb: 0.25 }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {children.length > 0 ? (expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />) : <Box sx={{ width: 24 }} />}
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32 }}>
          {isSelected ? <FolderOpenIcon color="primary" fontSize="small" /> : <FolderIcon fontSize="small" color="action" />}
        </ListItemIcon>
        <ListItemText primary={folder.name} primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }} />
      </ListItem>
      <Collapse in={expanded}>
        {children.map((child) => (
          <FolderTreeItem key={child.id} folder={child} folders={folders} selectedFolder={selectedFolder} onSelect={onSelect} depth={depth + 1} />
        ))}
      </Collapse>
    </>
  );
}

export default function DocumentListPage() {
  const theme = useTheme();
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const getFolderPath = (folderId) => {
    const path = [];
    let current = FOLDER_STRUCTURE.find((f) => f.id === folderId);
    while (current) {
      path.unshift(current);
      current = FOLDER_STRUCTURE.find((f) => f.id === current.parent);
    }
    return path;
  };

  const folderPath = getFolderPath(selectedFolder);
  const subfolders = FOLDER_STRUCTURE.filter((f) => f.parent === selectedFolder);

  const files = useMemo(() => {
    let list = MOCK_FILES.filter((f) => f.folder === selectedFolder);
    if (search) list = list.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [selectedFolder, search]);

  const handleCreateFolder = () => {
    toast.success(`Folder "${folderName}" created`);
    setFolderOpen(false);
    setFolderName('');
  };

  const handleFileUpload = (files) => {
    toast.success(`${files.length} file(s) uploaded`);
    setUploadOpen(false);
  };

  const getFileIcon = (type) => FILE_ICONS[type] || FILE_ICONS.default;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Documents"
        subtitle="Manage your documents and files"
        breadcrumbs={[{ label: 'Documents' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<CreateNewFolderIcon />} onClick={() => setFolderOpen(true)}>
              New Folder
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadOpen(true)}>
              Upload
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 220px)' }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ p: 2, pb: 1 }}>Folders</Typography>
            <List dense sx={{ pt: 0 }}>
              {FOLDER_STRUCTURE.filter((f) => f.parent === null).map((folder) => (
                <FolderTreeItem key={folder.id} folder={folder} folders={FOLDER_STRUCTURE} selectedFolder={selectedFolder} onSelect={setSelectedFolder} />
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" spacing={1}>
                <Breadcrumbs>
                  {folderPath.map((f, idx) => (
                    idx === folderPath.length - 1 ? (
                      <Typography key={f.id} variant="body2" fontWeight={600}>{f.name}</Typography>
                    ) : (
                      <Link key={f.id} variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setSelectedFolder(f.id)}>{f.name}</Link>
                    )
                  ))}
                </Breadcrumbs>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search files..." size="small" sx={{ minWidth: 220 }} />
                  <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                    <ToggleButton value="list"><TableRowsIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {subfolders.length > 0 && (
                <Box sx={{ mb: files.length > 0 ? 2 : 0 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>Folders</Typography>
                  <Grid container spacing={1}>
                    {subfolders.map((folder) => (
                      <Grid item xs={6} sm={4} md={3} key={folder.id}>
                        <Box
                          sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, display: 'flex', alignItems: 'center', gap: 1 }}
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <FolderIcon color="primary" />
                          <Typography variant="body2" noWrap>{folder.name}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {files.length === 0 && subfolders.length === 0 ? (
                <EmptyState
                  title="Empty folder"
                  description="Upload files or create folders to get started"
                  actionText="Upload Files"
                  actionIcon={<AddIcon />}
                  onAction={() => setUploadOpen(true)}
                />
              ) : viewMode === 'list' ? (
                <List>
                  {files.map((file) => (
                    <ListItem
                      key={file.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Download"><IconButton size="small"><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Rename"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Move"><IconButton size="small"><DriveFileMoveIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                      }
                      sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{getFileIcon(file.type)}</ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatBytes(file.size)} - Modified ${formatRelativeTime(file.modifiedAt)}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Grid container spacing={1.5}>
                  {files.map((file) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={file.id}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }, cursor: 'pointer' }}>
                        <Box sx={{ fontSize: 40, mb: 1 }}>{getFileIcon(file.type)}</Box>
                        <Typography variant="caption" noWrap display="block">{file.name}</Typography>
                        <Typography variant="caption" color="text.disabled">{formatBytes(file.size)}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          <FileUpload onFilesChange={handleFileUpload} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={folderOpen} onClose={() => setFolderOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Folder Name" value={folderName} onChange={(e) => setFolderName(e.target.value)} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFolder} disabled={!folderName}>Create</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
