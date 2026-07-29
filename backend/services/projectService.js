const { pool } = require('../db');

const findAll = async (userId) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.name as owner_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_count
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    WHERE p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
    ORDER BY p.updated_at DESC
  `, [userId, userId]);
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.name as owner_name
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    WHERE p.id = ? AND (p.owner_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))
  `, [id, userId, userId]);
  return rows[0] || null;
};

const create = async (userId, { name, description, color }) => {
  const [result] = await pool.query(
    'INSERT INTO projects (name, description, color, owner_id) VALUES (?, ?, ?, ?)',
    [name, description || '', color || '#6366f1', userId]
  );
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
  return rows[0];
};

const update = async (id, userId, { name, description, color }) => {
  await pool.query(
    'UPDATE projects SET name = ?, description = ?, color = ? WHERE id = ? AND owner_id = ?',
    [name, description || '', color || '#6366f1', id, userId]
  );
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0] || null;
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM projects WHERE id = ? AND owner_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const getMembers = async (projectId) => {
  const [rows] = await pool.query(`
    SELECT u.id, u.name, u.email, u.avatar, pm.role
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [projectId]);
  return rows;
};

const addMember = async (projectId, userId, role = 'member') => {
  await pool.query(
    'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [projectId, userId, role]
  );
};

const removeMember = async (projectId, userId) => {
  await pool.query(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
};

module.exports = { findAll, findById, create, update, remove, getMembers, addMember, removeMember };
