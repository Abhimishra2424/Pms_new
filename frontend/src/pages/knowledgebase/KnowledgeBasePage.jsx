import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Switch, FormControlLabel, Fab, alpha, useTheme,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import RichTextEditor from '../../components/common/RichTextEditor';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../../utils/helpers';

const CATEGORIES = [
  { id: 'all', name: 'All Articles', count: 12 },
  { id: 'getting-started', name: 'Getting Started', count: 3 },
  { id: 'guides', name: 'Guides & Tutorials', count: 5 },
  { id: 'faq', name: 'FAQ', count: 2 },
  { id: 'best-practices', name: 'Best Practices', count: 2 },
];

const MOCK_ARTICLES = [
  { id: 1, title: 'Getting Started with ProjectPro', excerpt: 'Learn the basics of using ProjectPro for project management', category: 'getting-started', author: 'Alice Johnson', avatar: '', date: '2026-07-20', views: 1245, readTime: 5, published: true, tags: ['onboarding', 'basics'] },
  { id: 2, title: 'How to Create and Manage Tasks', excerpt: 'Step-by-step guide to task management in ProjectPro', category: 'guides', author: 'Bob Smith', avatar: '', date: '2026-07-18', views: 892, readTime: 8, published: true, tags: ['tasks', 'management'] },
  { id: 3, title: 'Setting Up Your First Project', excerpt: 'Configure projects, invite team members, and start collaborating', category: 'guides', author: 'Alice Johnson', avatar: '', date: '2026-07-15', views: 2103, readTime: 6, published: true, tags: ['projects', 'setup'] },
  { id: 4, title: 'Frequently Asked Questions', excerpt: 'Common questions and answers about using the platform', category: 'faq', author: 'Admin', avatar: '', date: '2026-07-10', views: 567, readTime: 10, published: true, tags: ['faq'] },
  { id: 5, title: 'Best Practices for Sprint Planning', excerpt: 'Tips and tricks for effective sprint planning sessions', category: 'best-practices', author: 'Carol Davis', avatar: '', date: '2026-07-08', views: 1567, readTime: 7, published: true, tags: ['sprint', 'agile'] },
  { id: 6, title: 'Using the Gantt Chart View', excerpt: 'Visualize project timelines with the Gantt chart feature', category: 'guides', author: 'Bob Smith', avatar: '', date: '2026-07-05', views: 678, readTime: 4, published: false, tags: ['gantt', 'timeline'] },
  { id: 7, title: 'Keyboard Shortcuts', excerpt: 'Complete list of keyboard shortcuts to boost productivity', category: 'getting-started', author: 'Alice Johnson', avatar: '', date: '2026-07-01', views: 3456, readTime: 3, published: true, tags: ['shortcuts', 'productivity'] },
  { id: 8, title: 'Integrations Guide', excerpt: 'Connect ProjectPro with your favorite tools', category: 'guides', author: 'Carol Davis', avatar: '', date: '2026-06-28', views: 789, readTime: 9, published: true, tags: ['integrations', 'tools'] },
];

export default function KnowledgeBasePage() {
  const theme = useTheme();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewArticle, setViewArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'guides', content: '', tags: '', published: true,
  });

  const filtered = useMemo(() => {
    let list = MOCK_ARTICLES;
    if (category !== 'all') list = list.filter((a) => a.category === category);
    if (search) list = list.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [category, search]);

  const handleCreate = () => {
    toast.success('Article created');
    setFormOpen(false);
    setFormData({ title: '', category: 'guides', content: '', tags: '', published: true });
  };

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  if (viewArticle) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title={viewArticle.title}
          breadcrumbs={[{ label: 'Knowledge Base', href: '/knowledge-base' }, { label: viewArticle.title }]}
          actions={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setSelectedArticle(viewArticle); setFormData({ title: viewArticle.title, category: viewArticle.category, content: viewArticle.excerpt, tags: viewArticle.tags.join(', '), published: viewArticle.published }); setFormOpen(true); }}>Edit</Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Delete</Button>
            </Stack>
          }
        />
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={viewArticle.avatar} sx={{ bgcolor: generateAvatarColor(viewArticle.author) }}>{getInitials(viewArticle.author)}</Avatar>
              <Box>
                <Typography variant="subtitle2">{viewArticle.author}</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(viewArticle.date)} &middot; {viewArticle.readTime} min read</Typography>
              </Box>
              <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                <Chip icon={<VisibilityIcon />} label={viewArticle.views} size="small" variant="outlined" />
                <Chip label={viewArticle.category.replace('-', ' ')} size="small" color="primary" variant="outlined" />
              </Stack>
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>{viewArticle.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>{viewArticle.excerpt}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
              {viewArticle.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
            </Stack>
          </CardContent>
        </Card>
        <Button sx={{ mt: 2 }} onClick={() => setViewArticle(null)}>Back to Articles</Button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Knowledge Base"
        subtitle="Articles and guides"
        breadcrumbs={[{ label: 'Knowledge Base' }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Create Article
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Box sx={{ flex: 1, maxWidth: 400 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search articles..." />
        </Box>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <motion.div variants={childVariants}>
            <Card>
              <List dense disablePadding>
                {CATEGORIES.map((cat) => (
                  <ListItemButton key={cat.id} selected={category === cat.id} onClick={() => setCategory(cat.id)} sx={{ borderRadius: 1, mx: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CategoryIcon fontSize="small" color={category === cat.id ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText primary={cat.name} primaryTypographyProps={{ variant: 'body2', fontWeight: category === cat.id ? 600 : 400 }} />
                    <Chip label={cat.count} size="small" variant="outlined" />
                  </ListItemButton>
                ))}
              </List>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={9}>
          <motion.div variants={childVariants}>
            {filtered.length === 0 ? (
              <EmptyState title="No articles found" description="Try a different category or search term" />
            ) : (
              <Stack spacing={1.5}>
                {filtered.map((article) => (
                  <Card key={article.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }} onClick={() => setViewArticle(article)}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
                          <ArticleIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>{article.title}</Typography>
                            {!article.published && <Chip label="Draft" size="small" variant="outlined" color="warning" />}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{article.excerpt}</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Chip label={article.category.replace('-', ' ')} size="small" color="primary" variant="outlined" />
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PersonIcon fontSize="inherit" color="action" />
                              <Typography variant="caption" color="text.secondary">{article.author}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <VisibilityIcon fontSize="inherit" color="action" />
                              <Typography variant="caption" color="text.secondary">{article.views}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTimeIcon fontSize="inherit" color="action" />
                              <Typography variant="caption" color="text.secondary">{article.readTime} min read</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.disabled">{formatRelativeTime(article.date)}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </motion.div>
        </Grid>
      </Grid>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setFormOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedArticle ? 'Edit Article' : 'Create Article'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField select label="Category" value={formData.category} onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))} fullWidth>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <RichTextEditor value={formData.content} onChange={(v) => setFormData((f) => ({ ...f, content: v }))} height={300} />
            </Box>
            <TextField label="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))} fullWidth />
            <FormControlLabel control={<Switch checked={formData.published} onChange={(e) => setFormData((f) => ({ ...f, published: e.target.checked }))} />} label="Publish" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormOpen(false); setSelectedArticle(null); }}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={!formData.title}>
            {selectedArticle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
