import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Login, Register } from './Auth';
import { marked } from 'marked';
import './App.css';

const THEME_KEY = 'notes-theme';
const COLORS = [
  { value: '#6366f1', label: 'Purple' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#14b8a6', label: 'Teal' },
];

function Notes() {
  const { token, user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', color: '#6366f1', reminder_at: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [sort, setSort] = useState('updated');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [stats, setStats] = useState(null);
  const [trash, setTrash] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const fetchNotes = () => {
    const params = new URLSearchParams({ archived: filter === 'archived' ? 'true' : 'false' });
    if (search) params.set('q', search);
    fetch(`/api/notes?${params}`, { headers })
      .then(r => r.json())
      .then(data => {
        let sorted = [...data];
        if (sort === 'oldest') sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === 'newest' || sort === 'updated') sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setNotes(sorted);
      }).catch(console.error);
  };

  const fetchStats = () => {
    fetch('/api/stats', { headers }).then(r => r.json()).then(setStats).catch(console.error);
  };

  const fetchTrash = () => {
    fetch('/api/notes/trash', { headers }).then(r => r.json()).then(setTrash).catch(console.error);
  };

  useEffect(() => { fetchNotes(); }, [filter, search, sort]);
  useEffect(() => { fetchStats(); }, [notes]);

  useEffect(() => {
    fetch('/api/tags', { headers }).then(r => r.json()).then(setTags).catch(console.error);
  }, []);

  const resetForm = () => { setForm({ title: '', content: '', color: '#6366f1', reminder_at: '' }); setEditingId(null); setPreview(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const body = { ...form, reminder_at: form.reminder_at || null };
    const url = editingId ? `/api/notes/${editingId}` : '/api/notes';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    const note = await res.json();
    if (editingId) {
      setNotes(notes.map(n => n.id === note.id ? note : n));
    } else {
      setNotes([note, ...notes]);
    }
    resetForm();
  };

  const handleEdit = (note) => {
    setForm({
      title: note.title,
      content: note.content || '',
      color: note.color || '#6366f1',
      reminder_at: note.reminder_at ? note.reminder_at.slice(0, 16) : '',
    });
    setEditingId(note.id);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE', headers });
    setNotes(notes.filter(n => n.id !== id));
  };

  const togglePin = async (id) => {
    const res = await fetch(`/api/notes/${id}/pin`, { method: 'PATCH', headers });
    const { pinned } = await res.json();
    setNotes(notes.map(n => n.id === id ? { ...n, pinned } : n));
  };

  const toggleArchive = async (id) => {
    const res = await fetch(`/api/notes/${id}/archive`, { method: 'PATCH', headers });
    const { archived } = await res.json();
    if (filter !== 'archived') setNotes(notes.filter(n => n.id !== id));
    else setNotes(notes.map(n => n.id === id ? { ...n, archived } : n));
  };

  const restoreNote = async (id) => {
    await fetch(`/api/notes/${id}/restore`, { method: 'PATCH', headers });
    setTrash(trash.filter(n => n.id !== id));
    fetchNotes();
    fetchStats();
  };

  const permanentDelete = async (id) => {
    await fetch(`/api/notes/${id}/permanent`, { method: 'DELETE', headers });
    setTrash(trash.filter(n => n.id !== id));
    fetchStats();
  };

  const createTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch('/api/tags', { method: 'POST', headers, body: JSON.stringify({ name: newTag.trim() }) });
    if (res.ok) { setTags([...tags, await res.json()]); setNewTag(''); }
  };

  const deleteTag = async (id) => {
    await fetch(`/api/tags/${id}`, { method: 'DELETE', headers });
    setTags(tags.filter(t => t.id !== id));
  };

  const handleShare = async (id) => {
    const res = await fetch(`/api/notes/${id}/share`, { method: 'POST', headers });
    const data = await res.json();
    if (data.shareUrl) {
      await navigator.clipboard.writeText(data.shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const handleFileUpload = async (id) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/notes/${id}/file`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    if (res.ok) {
      const data = await res.json();
      setNotes(notes.map(n => n.id === id ? { ...n, file_path: data.file_path } : n));
    }
    setUploading(false);
    fileRef.current.value = '';
  };

  const charCount = form.content.length;
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  const openTrash = () => { fetchTrash(); setShowTrash(true); };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (showTrash) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🗑️ Trash</h1>
          <button onClick={() => setShowTrash(false)}>Back</button>
        </div>
        <div className="notes-list">
          {trash.length === 0 && <p className="empty">Trash is empty</p>}
          {trash.map(note => (
            <div key={note.id} className="note-card trash-card" style={{ borderLeftColor: note.color || '#6366f1' }}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-footer">
                <span className="note-date">Deleted {formatDate(note.deleted_at)}</span>
                <div className="note-actions">
                  <button onClick={() => restoreNote(note.id)} title="Restore">♻️</button>
                  <button onClick={() => permanentDelete(note.id)} title="Delete forever" className="delete-btn">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Notes</h1>
        <div className="header-right">
          <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
          <span className="user-greeting">{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {stats && (
        <div className="stats-bar">
          <span>📝 {stats.total}</span>
          <span>📌 {stats.pinned}</span>
          <span>📦 {stats.archived}</span>
          <span>🗑️ <button className="link-btn" onClick={openTrash}>{stats.trashed}</button></span>
          <span>🏷️ {stats.tags}</span>
          <span>📊 {stats.words} words</span>
          <a className="export-link" href="/api/stats/export" onClick={e => { e.preventDefault(); fetch('/api/stats/export', { headers }).then(r => r.blob()).then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'notes-export.json'; a.click(); }); }} title="Export JSON">📥 Export</a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-form">
        <input placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div className="editor-toolbar">
          <button type="button" className={preview ? '' : 'active'} onClick={() => setPreview(false)}>Write</button>
          <button type="button" className={preview ? 'active' : ''} onClick={() => setPreview(true)}>Preview</button>
        </div>
        {preview ? (
          <div className="preview" dangerouslySetInnerHTML={{ __html: marked(form.content || '') }} />
        ) : (
          <textarea placeholder="Write your note... (Markdown supported)" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        )}
        <div className="form-meta">
          <span className="word-count">{charCount} chars · {wordCount} words</span>
        </div>
        <div className="color-picker">
          <span className="color-label">Color</span>
          <div className="color-options">
            {COLORS.map(c => (
              <button key={c.value} type="button" className={`color-swatch ${form.color === c.value ? 'active' : ''}`} style={{ background: c.value }} onClick={() => setForm({ ...form, color: c.value })} title={c.label} />
            ))}
          </div>
        </div>
        <div className="form-row">
          <label className="reminder-label">🔔 Reminder</label>
          <input type="datetime-local" value={form.reminder_at} onChange={e => setForm({ ...form, reminder_at: e.target.value })} className="reminder-input" />
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? 'Update' : 'Add'} Note</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="toolbar">
        <div className="search-bar">
          <input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-row">
          <div className="filter-chips">
            {['active', 'archived'].map(f => (
              <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'active' ? '📋 Active' : '📦 Archived'}
              </button>
            ))}
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="updated">Recently Updated</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      <div className="tags-section">
        <div className="tags-header">
          <span>🏷️ Tags</span>
          <div className="tag-input-group">
            <input placeholder="New tag..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), createTag())} />
            <button type="button" onClick={createTag}>+</button>
          </div>
        </div>
        <div className="tags-list">
          {tags.length === 0 && <span className="no-tags">No tags yet</span>}
          {tags.map(tag => (
            <span key={tag.id} className="tag-badge" style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}>
              {tag.name}
              <button className="tag-remove" onClick={() => deleteTag(tag.id)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="notes-list">
        {notes.length === 0 && <p className="empty">{search ? 'No matching notes' : filter === 'archived' ? 'No archived notes' : 'No notes yet — create one above!'}</p>}
        {notes.map(note => (
          <div key={note.id} className="note-card" style={{ borderLeftColor: note.color || '#6366f1' }}>
            <div className="note-header">
              <h3>{note.title}</h3>
              <button className={`pin-btn ${note.pinned ? 'pinned' : ''}`} onClick={() => togglePin(note.id)} title={note.pinned ? 'Unpin' : 'Pin'}>{note.pinned ? '📌' : '📍'}</button>
            </div>
            <div className="note-content" dangerouslySetInnerHTML={{ __html: marked(note.content || '') }} />
            {note.reminder_at && <div className="reminder-badge">🔔 {formatDate(note.reminder_at)}</div>}
            {note.file_path && (
              <div className="file-attachment">
                📎 <a href={`/uploads/${note.file_path}`} target="_blank" rel="noopener noreferrer">{note.file_path}</a>
              </div>
            )}
            <div className="note-footer">
              <span className="note-date">{formatDate(note.updated_at)}</span>
              <div className="note-actions">
                <button onClick={() => handleEdit(note)} title="Edit">✏️</button>
                <button onClick={() => toggleArchive(note.id)} title={note.archived ? 'Restore' : 'Archive'}>{note.archived ? '📤' : '📥'}</button>
                <button onClick={() => handleShare(note.id)} title="Share">🔗</button>
                <label className="file-btn" title="Attach file">
                  📎
                  <input type="file" hidden onChange={() => handleFileUpload(note.id)} ref={fileRef} />
                </label>
                <button onClick={() => handleDelete(note.id)} title="Delete" className="delete-btn">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {uploading && <div className="toast">Uploading...</div>}
    </div>
  );
}

function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  if (user) return <Notes />;

  return (
    <div className="app">
      <div className="app-header" style={{ justifyContent: 'space-between' }}>
        <h1>Notes App</h1>
        <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
      </div>
      <div className="auth-header">
        <p>Your personal note-taking companion</p>
      </div>
      <div className="auth-toggle">
        <button onClick={() => setShowLogin(true)} className={showLogin ? 'active' : ''}>Login</button>
        <button onClick={() => setShowLogin(false)} className={!showLogin ? 'active' : ''}>Register</button>
      </div>
      {showLogin ? <Login /> : <Register />}
    </div>
  );
}

export default App;
