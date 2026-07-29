const { pool } = require('../db');

const findByProject = async (projectId, userId) => {
  const [rows] = await pool.query(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.project_id = ?
    ORDER BY FIELD(t.priority, 'urgent','high','medium','low'), t.updated_at DESC
  `, [projectId]);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar, cr.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    JOIN users cr ON t.created_by = cr.id
    WHERE t.id = ?
  `, [id]);
  return rows[0] || null;
};

const create = async (projectId, userId, { title, description, status, priority, assignee_id, due_date }) => {
  const [result] = await pool.query(
    'INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [projectId, title, description || '', status || 'todo', priority || 'medium', assignee_id || null, due_date || null, userId]
  );
  return await findById(result.insertId);
};

const update = async (id, { title, description, status, priority, assignee_id, due_date }) => {
  await pool.query(
    'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, due_date = ? WHERE id = ?',
    [title, description || '', status || 'todo', priority || 'medium', assignee_id || null, due_date || null, id]
  );
  return await findById(id);
};

const updateStatus = async (id, status) => {
  await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  return await findById(id);
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND created_by = ?', [id, userId]);
  return result.affectedRows > 0;
};

const getDashboardStats = async (userId) => {
  const [[{ projects }]] = await pool.query(
    'SELECT COUNT(*) as projects FROM projects WHERE owner_id = ?', [userId]
  );
  const [[{ tasks }]] = await pool.query(
    'SELECT COUNT(*) as tasks FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.owner_id = ?', [userId]
  );
  const [[{ todo }]] = await pool.query(
    "SELECT COUNT(*) as todo FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.owner_id = ? AND t.status = 'todo'", [userId]
  );
  const [[{ in_progress }]] = await pool.query(
    "SELECT COUNT(*) as in_progress FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.owner_id = ? AND t.status = 'in_progress'", [userId]
  );
  const [[{ done }]] = await pool.query(
    "SELECT COUNT(*) as done FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.owner_id = ? AND t.status = 'done'", [userId]
  );
  const [[{ overdue }]] = await pool.query(
    'SELECT COUNT(*) as overdue FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.owner_id = ? AND t.due_date IS NOT NULL AND t.due_date < CURDATE() AND t.status != "done"', [userId]
  );
  const [recent] = await pool.query(`
    SELECT t.id, t.title, t.status, t.priority, t.due_date, p.name as project_name, p.color as project_color
    FROM tasks t JOIN projects p ON t.project_id = p.id
    WHERE p.owner_id = ?
    ORDER BY t.updated_at DESC LIMIT 5
  `, [userId]);

  return {
    projects: Number(projects),
    tasks: Number(tasks),
    todo: Number(todo),
    in_progress: Number(in_progress),
    done: Number(done),
    overdue: Number(overdue),
    recent,
  };
};

module.exports = { findByProject, findById, create, update, updateStatus, remove, getDashboardStats };
