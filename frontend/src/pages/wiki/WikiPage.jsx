import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Breadcrumbs, Link,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse, alpha, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import RichTextEditor from '../../components/common/RichTextEditor';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatRelativeTime } from '../../utils/helpers';

const WIKI_PAGES = [
  { id: 'welcome', title: 'Welcome to the Wiki', parent: null, content: '<h1>Welcome</h1><p>This is the collaborative wiki for the team.</p>', updatedAt: '2026-07-28', updatedBy: 'Alice Johnson' },
  { id: 'onboarding', title: 'Employee Onboarding', parent: 'welcome', content: '<h2>Onboarding Process</h2><p>Steps for new employee onboarding.</p>', updatedAt: '2026-07-25', updatedBy: 'Bob Smith' },
  { id: 'development', title: 'Development Guide', parent: null, content: '<h1>Development</h1><p>Development standards and guidelines.</p>', updatedAt: '2026-07-20', updatedBy: 'Carol Davis' },
  { id: 'frontend', title: 'Frontend Standards', parent: 'development', content: '<h2>Frontend</h2><p>React and MUI coding standards.</p>', updatedAt: '2026-07-18', updatedBy: 'Alice Johnson' },
  { id: 'backend', title: 'Backend Standards', parent: 'development', content: '<h2>Backend</h2><p>Node.js and API standards.</p>', updatedAt: '2026-07-15', updatedBy: 'Bob Smith' },
  { id: 'design', title: 'Design System', parent: null, content: '<h1>Design System</h1><p>UI/UX design guidelines and component library documentation.</p>', updatedAt: '2026-07-10', updatedBy: 'Carol Davis' },
  { id: 'components', title: 'Component Library', parent: 'design', content: '<h2>Components</h2><p>Available components and usage examples.</p>', updatedAt: '2026-07-08', updatedBy: 'Alice Johnson' },
];

function WikiTreeItem({ page, pages, selectedPage, onSelect, depth = 0 }) {
  const children = pages.filter((p) => p.parent === page.id);
  const isSelected = selectedPage === page.id;
  const [expanded, setExpanded] = useState(depth < 1);

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={() => { onSelect(page.id); setExpanded(!expanded); }}
        sx={{ pl: 1 + depth * 2.5, borderRadius: 1, mb: 0.25, ml: 0.5, mr: 0.5 }}
      >
        <ListItemIcon sx={{ minWidth: 28 }}>
          {children.length > 0 ? (expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />) : <ArticleIcon fontSize="small" color="action" />}
        </ListItemIcon>
        <ListItemText primary={page.title} primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400, noWrap: true }} />
      </ListItemButton>
      <Collapse in={expanded}>
        {children.map((child) => (
          <WikiTreeItem key={child.id} page={child} pages={pages} selectedPage={selectedPage} onSelect={onSelect} depth={depth + 1} />
        ))}
      </Collapse>
    </>
  );
}

export default function WikiPage() {
  const theme = useTheme();
  const [selectedPageId, setSelectedPageId] = useState('welcome');
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', parent: '', content: '' });

  const getPagePath = (pageId) => {
    const path = [];
    let current = WIKI_PAGES.find((p) => p.id === pageId);
    while (current) {
      path.unshift(current);
      current = WIKI_PAGES.find((p) => p.id === current.parent);
    }
    return path;
  };

  const selectedPage = WIKI_PAGES.find((p) => p.id === selectedPageId);
  const pagePath = selectedPage ? getPagePath(selectedPageId) : [];
  const rootPages = WIKI_PAGES.filter((p) => p.parent === null);

  const handleSave = () => {
    toast.success('Page created');
    setFormOpen(false);
    setFormData({ title: '', parent: '', content: '' });
  };

  const handleDelete = () => {
    toast.success('Page deleted');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Wiki"
        subtitle="Collaborative documentation"
        breadcrumbs={[{ label: 'Wiki' }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              New Page
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 220px)' }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ p: 2, pb: 1 }}>Pages</Typography>
            <List dense sx={{ pt: 0 }}>
              {rootPages.map((page) => (
                <WikiTreeItem key={page.id} page={page} pages={WIKI_PAGES} selectedPage={selectedPageId} onSelect={setSelectedPageId} />
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          {selectedPage ? (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" spacing={1}>
                  <Breadcrumbs>
                    {pagePath.map((p, idx) => (
                      idx === pagePath.length - 1 ? (
                        <Typography key={p.id} variant="body2" fontWeight={600}>{p.title}</Typography>
                      ) : (
                        <Link key={p.id} variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setSelectedPageId(p.id)}>{p.title}</Link>
                      )
                    ))}
                  </Breadcrumbs>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={handleDelete}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <div dangerouslySetInnerHTML={{ __html: selectedPage.content }} />
                <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <HistoryIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Last updated {formatRelativeTime(selectedPage.updatedAt)} by {selectedPage.updatedBy}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Card>
          ) : (
            <EmptyState title="Select a page" description="Choose a page from the sidebar to view its content" />
          )}
        </Grid>
      </Grid>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Wiki Page</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField select label="Parent Page" value={formData.parent} onChange={(e) => setFormData((f) => ({ ...f, parent: e.target.value }))} fullWidth>
              <MenuItem value="">None (Root level)</MenuItem>
              {WIKI_PAGES.map((p) => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
            </TextField>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <RichTextEditor value={formData.content} onChange={(v) => setFormData((f) => ({ ...f, content: v }))} height={400} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleSave} disabled={!formData.title}>Create</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
