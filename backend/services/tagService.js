const { pool } = require('../db');

const findAll = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM tags WHERE user_id = ? ORDER BY name', [userId]);
  return rows;
};

const create = async (userId, { name, color }) => {
  const [result] = await pool.query('INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)', [name, color || '#6366f1', userId]);
  const [rows] = await pool.query('SELECT * FROM tags WHERE id = ?', [result.insertId]);
  return rows[0];
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

const getNoteTags = async (noteId) => {
  const [rows] = await pool.query(
    'SELECT t.* FROM tags t JOIN note_tags nt ON t.id = nt.tag_id WHERE nt.note_id = ?',
    [noteId]
  );
  return rows;
};

const addToNote = async (noteId, tagId) => {
  await pool.query('INSERT IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tagId]);
};

const removeFromNote = async (noteId, tagId) => {
  await pool.query('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?', [noteId, tagId]);
};

module.exports = { findAll, create, remove, getNoteTags, addToNote, removeFromNote };
