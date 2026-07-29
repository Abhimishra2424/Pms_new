const { pool } = require('../db');

const findByTask = async (taskId) => {
  const [rows] = await pool.query(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM task_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ?
    ORDER BY c.created_at ASC
  `, [taskId]);
  return rows;
};

const create = async (taskId, userId, content) => {
  const [result] = await pool.query(
    'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
    [taskId, userId, content]
  );
  const [rows] = await pool.query(`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM task_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [result.insertId]);
  return rows[0];
};

const remove = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM task_comments WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

module.exports = { findByTask, create, remove };
