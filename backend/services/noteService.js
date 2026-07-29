const { pool } = require('../db');

const findAll = async (userId, { q, archived }) => {
  let sql = 'SELECT * FROM notes WHERE user_id = ? AND deleted_at IS NULL';
  const params = [userId];

  if (archived === 'true') sql += ' AND archived = TRUE';
  else if (archived === 'false' || !archived) sql += ' AND archived = FALSE';

  if (q) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' ORDER BY pinned DESC, updated_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const findTrash = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM notes WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC', [userId]);
  return rows;
};

const findUpcoming = async (userId) => {
  const [rows] = await pool.query('SELECT id, title, reminder_at FROM notes WHERE user_id = ? AND reminder_at IS NOT NULL AND deleted_at IS NULL ORDER BY reminder_at ASC', [userId]);
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] || null;
};

const findByShareToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT n.id, n.title, n.content, n.color, n.created_at, n.updated_at, u.name as author FROM notes n JOIN users u ON n.user_id = u.id WHERE n.share_token = ? AND n.deleted_at IS NULL',
    [token]
  );
  return rows[0] || null;
};

const create = async (userId, { title, content, color, reminder_at }) => {
  const [result] = await pool.query(
    'INSERT INTO notes (user_id, title, content, color, reminder_at) VALUES (?, ?, ?, ?, ?)',
    [userId, title, content, color || '#6366f1', reminder_at || null]
  );
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
  return rows[0];
};

const update = async (id, userId, { title, content, color, reminder_at }) => {
  await pool.query(
    'UPDATE notes SET title = ?, content = ?, color = ?, reminder_at = ? WHERE id = ? AND user_id = ?',
    [title, content, color || '#6366f1', reminder_at || null, id, userId]
  );
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [id]);
  return rows[0] || null;
};

const togglePin = async (id, userId) => {
  const [rows] = await pool.query('SELECT pinned FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  if (!rows[0]) return null;
  const newPinned = !rows[0].pinned;
  await pool.query('UPDATE notes SET pinned = ? WHERE id = ?', [newPinned, id]);
  return newPinned;
};

const toggleArchive = async (id, userId) => {
  const [rows] = await pool.query('SELECT archived FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  if (!rows[0]) return null;
  const newArchived = !rows[0].archived;
  await pool.query('UPDATE notes SET archived = ? WHERE id = ?', [newArchived, id]);
  return newArchived;
};

const softDelete = async (id, userId) => {
  const [result] = await pool.query('UPDATE notes SET deleted_at = NOW() WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const restore = async (id, userId) => {
  const [result] = await pool.query('UPDATE notes SET deleted_at = NULL, archived = FALSE WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [id]);
  return rows[0];
};

const permanentDelete = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const setShareToken = async (id, userId, token) => {
  await pool.query('UPDATE notes SET share_token = ? WHERE id = ? AND user_id = ?', [token, id, userId]);
};

const setFilePath = async (id, userId, filePath) => {
  await pool.query('UPDATE notes SET file_path = ? WHERE id = ? AND user_id = ?', [filePath, id, userId]);
};

const getAllForExport = async (userId) => {
  const [notes] = await pool.query(
    'SELECT id, title, content, color, pinned, archived, created_at, updated_at FROM notes WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
    [userId]
  );
  for (const note of notes) {
    const [tags] = await pool.query(
      'SELECT t.name FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?',
      [note.id]
    );
    note.tags = tags.map(t => t.name);
  }
  return notes;
};

module.exports = {
  findAll, findTrash, findUpcoming, findById, findByShareToken,
  create, update, togglePin, toggleArchive,
  softDelete, restore, permanentDelete,
  setShareToken, setFilePath, getAllForExport,
};
