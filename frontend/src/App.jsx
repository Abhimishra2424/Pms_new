import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Login, Register } from './Auth';
import './App.css';

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#64748b' };
const STATUSES = ['todo', 'in_progress', 'done'];

function Sidebar({ activeTab, setActiveTab, projects, onSelectProject, selectedProjectId, onLogout, user, dark, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>PMS</h2>
        <button className="icon-btn" onClick={toggleTheme}>{dark ? '☀️' : '🌙'}</button>
      </div>
      <nav className="sidebar-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); onSelectProject(null); }}>
          📊 Dashboard
        </button>
        <div className="nav-section-label">Projects</div>
        {projects.map(p => (
          <button key={p.id} className={`nav-item project-item ${selectedProjectId === p.id ? 'active' : ''}`} onClick={() => { onSelectProject(p.id); setActiveTab('project'); }}>
            <span className="project-dot" style={{ background: p.color }} />
            <span className="project-nav-name">{p.name}</span>
            <span className="project-nav-count">{p.task_count}</span>
          </button>
        ))}
        <button className="nav-item new-project-btn" onClick={() => setActiveTab('new-project')}>
          + New Project
        </button>
      </nav>
      <div className="sidebar-footer">
        <span className="user-name">{user?.name}</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

function Dashboard({ stats, projects, onSelectProject }) {
  const cards = [
    { label: 'Projects', value: stats?.projects || 0, color: '#818cf8', icon: '📁' },
    { label: 'Total Tasks', value: stats?.tasks || 0, color: '#3b82f6', icon: '📋' },
    { label: 'To Do', value: stats?.todo || 0, color: '#64748b', icon: '📝' },
    { label: 'In Progress', value: stats?.in_progress || 0, color: '#f59e0b', icon: '🔄' },
    { label: 'Done', value: stats?.done || 0, color: '#10b981', icon: '✅' },
    { label: 'Overdue', value: stats?.overdue || 0, color: '#ef4444', icon: '⚠️' },
  ];

  return (
    <main className="main-content">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{c.value}</span>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Recent Tasks</h2>
      {stats?.recent?.length > 0 ? (
        <div className="recent-tasks">
          {stats.recent.map(task => (
            <div key={task.id} className="recent-task-row">
              <div className="recent-task-info">
                <span className="recent-task-title">{task.title}</span>
                <span className="recent-task-project" style={{ color: task.project?.color }}>{task.project?.name}</span>
              </div>
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              <span className={`status-badge ${task.status}`}>{task.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No tasks yet. Create a project and start adding tasks!</p>
      )}

      <h2 className="section-title">Projects</h2>
      <div className="project-grid">
        {projects.map(p => (
          <div key={p.id} className="project-card" style={{ borderTopColor: p.color }} onClick={() => onSelectProject(p.id)}>
            <div className="project-card-header">
              <span className="project-card-icon" style={{ background: p.color }}>{p.name[0]}</span>
              <h3>{p.name}</h3>
            </div>
            <p>{p.description || 'No description'}</p>
            <div className="project-card-footer">
              <span>{p.task_count || 0} tasks</span>
              <span className="progress-bar">
                <span className="progress-fill" style={{ width: p.task_count ? `${(p.done_count / p.task_count) * 100}%` : '0%', background: p.color }} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ProjectBoard({ project, tasks, onBack, onCreateTask, onStatusChange, onEditTask, onDeleteTask, onAddComment }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' });
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };

  const openTask = async (task) => {
    setSelectedTask(task);
    const res = await fetch(`/api/tasks/${task.id}/comments`, { headers });
    if (res.ok) setComments(await res.json());
    setShowModal(true);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, { method: 'POST', headers, body: JSON.stringify({ content: comment }) });
    if (res.ok) {
      setComments([...comments, await res.json()]);
      setComment('');
    }
  };

  const grouped = {};
  STATUSES.forEach(s => { grouped[s] = tasks.filter(t => t.status === s); });

  return (
    <main className="main-content">
      <div className="project-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="page-title" style={{ color: project?.color }}>{project?.name}</h1>
        <button className="primary-btn" onClick={() => setNewTask({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' })}>
          + New Task
        </button>
      </div>

      <div className="kanban-board">
        {STATUSES.map(status => (
          <div key={status} className="kanban-column">
            <div className="kanban-column-header">
              <span className={`status-badge ${status}`}>{status.replace('_', ' ').toUpperCase()}</span>
              <span className="kanban-count">{grouped[status]?.length || 0}</span>
            </div>
            <div className="kanban-cards" onDragOver={e => e.preventDefault()} onDrop={async (e) => {
              const id = e.dataTransfer.getData('taskId');
              if (id) await onStatusChange(id, status);
            }}>
              {(grouped[status] || []).map(task => (
                <div key={task.id} className="kanban-card" draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)} onClick={() => openTask(task)}>
                  <div className="kanban-card-header">
                    <span className={`priority-indicator ${task.priority}`} />
                    <span className="kanban-card-title">{task.title}</span>
                  </div>
                  {task.assignee && <span className="assignee-name">👤 {task.assignee.name}</span>}
                  {task.due_date && <span className={`due-date ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'overdue' : ''}`}>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              ))}
              {(grouped[status] || []).length === 0 && <div className="kanban-empty">Drop tasks here</div>}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <input className="modal-title-input" value={selectedTask.title} onChange={async e => {
                const newTitle = e.target.value;
                setSelectedTask({ ...selectedTask, title: newTitle });
                await fetch(`/api/tasks/${selectedTask.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...selectedTask, title: newTitle }) });
              }} />
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="task-meta">
              <span className={`status-badge ${selectedTask.status}`}>{selectedTask.status.replace('_', ' ')}</span>
              <span className={`priority-badge ${selectedTask.priority}`}>{selectedTask.priority}</span>
              {selectedTask.due_date && <span>📅 {new Date(selectedTask.due_date).toLocaleDateString()}</span>}
              {selectedTask.assignee && <span>👤 {selectedTask.assignee.name}</span>}
            </div>
            <div className="status-actions">
              {STATUSES.map(s => (
                <button key={s} className={`status-btn ${selectedTask.status === s ? 'active' : ''}`} onClick={async () => {
                  const updated = await (await fetch(`/api/tasks/${selectedTask.id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status: s }) })).json();
                  setSelectedTask(updated);
                  onStatusChange(selectedTask.id, s);
                }}>{s.replace('_', ' ')}</button>
              ))}
            </div>
            <textarea className="modal-desc" value={selectedTask.description || ''} placeholder="Description..." onChange={async e => {
              const desc = e.target.value;
              setSelectedTask({ ...selectedTask, description: desc });
              await fetch(`/api/tasks/${selectedTask.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...selectedTask, description: desc }) });
            }} />
            <div className="comments-section">
              <h4>Comments</h4>
              <div className="comments-list">
                {comments.map(c => (
                  <div key={c.id} className="comment">
                    <span className="comment-user">{c.user?.name || 'Unknown'}</span>
                    <span className="comment-text">{c.content}</span>
                    <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProjectForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSubmit(form);
    setForm({ name: '', description: '', color: '#6366f1' });
  };

  return (
    <main className="main-content">
      <h1 className="page-title">New Project</h1>
      <form className="project-form" onSubmit={handleSubmit}>
        <input placeholder="Project name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        <textarea placeholder="Description (optional)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="color-picker">
          <span>Color</span>
          <div className="color-options">
            {COLORS.map(c => (
              <button key={c} type="button" className={`color-swatch ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Create Project</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </main>
  );
}

function App() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects', { headers });
    if (res.ok) setProjects(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch('/api/tasks/dashboard', { headers });
    if (res.ok) setStats(await res.json());
  };

  const fetchTasks = async (projectId) => {
    if (!projectId) return;
    const res = await fetch(`/api/tasks/project/${projectId}`, { headers });
    if (res.ok) setTasks(await res.json());
  };

  useEffect(() => { if (user) { fetchProjects(); fetchStats(); } }, [user]);
  useEffect(() => { if (selectedProjectId) { fetchTasks(selectedProjectId); fetchProjects(); } }, [selectedProjectId]);

  const selectProject = async (id) => {
    setSelectedProjectId(id);
    setActiveTab('project');
    const res = await fetch(`/api/projects/${id}`, { headers });
    if (res.ok) setSelectedProject(await res.json());
  };

  const createProject = async (data) => {
    const res = await fetch('/api/projects', { method: 'POST', headers, body: JSON.stringify(data) });
    if (res.ok) { await fetchProjects(); await fetchStats(); setActiveTab('dashboard'); }
  };

  const createTask = async (data) => {
    const res = await fetch(`/api/tasks/project/${selectedProjectId}`, { method: 'POST', headers, body: JSON.stringify(data) });
    if (res.ok) { await fetchTasks(selectedProjectId); await fetchStats(); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/tasks/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    await fetchTasks(selectedProjectId);
    await fetchStats();
  };

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header-section">
            <h1>Project Management System</h1>
            <p>Organize your work, manage projects, track tasks</p>
          </div>
          <div className="auth-toggle">
            <button onClick={() => setShowLogin(true)} className={showLogin ? 'active' : ''}>Sign In</button>
            <button onClick={() => setShowLogin(false)} className={!showLogin ? 'active' : ''}>Sign Up</button>
          </div>
          {showLogin ? <Login /> : <Register />}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        projects={projects} onSelectProject={selectProject} selectedProjectId={selectedProjectId}
        onLogout={logout} user={user} dark={dark} toggleTheme={() => setDark(!dark)}
      />
      {activeTab === 'dashboard' && <Dashboard stats={stats} projects={projects} onSelectProject={selectProject} />}
      {activeTab === 'project' && <ProjectBoard project={selectedProject} tasks={tasks} onBack={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }} onCreateTask={createTask} onStatusChange={updateStatus} onDeleteTask={() => {}} onAddComment={() => {}} />}
      {activeTab === 'new-project' && <ProjectForm onSubmit={createProject} onCancel={() => setActiveTab('dashboard')} />}
    </div>
  );
}

export default App;
