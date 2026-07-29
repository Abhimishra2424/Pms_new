const { pool } = require('../db');

const getStats = async (userId) => {
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) as total FROM notes WHERE user_id = ? AND deleted_at IS NULL', [userId]
  );
  const [[{ pinned }]] = await pool.query(
    'SELECT COUNT(*) as pinned FROM notes WHERE user_id = ? AND pinned = TRUE AND deleted_at IS NULL', [userId]
  );
  const [[{ archived }]] = await pool.query(
    'SELECT COUNT(*) as archived FROM notes WHERE user_id = ? AND archived = TRUE AND deleted_at IS NULL', [userId]
  );
  const [[{ trashed }]] = await pool.query(
    'SELECT COUNT(*) as trashed FROM notes WHERE user_id = ? AND deleted_at IS NOT NULL', [userId]
  );
  const [[{ tags }]] = await pool.query(
    'SELECT COUNT(*) as tags FROM tags WHERE user_id = ?', [userId]
  );
  const [[{ words }]] = await pool.query(
    `SELECT COALESCE(SUM(LENGTH(content) - LENGTH(REPLACE(content, " ", "")) + 1), 0) as words
     FROM notes WHERE user_id = ? AND deleted_at IS NULL AND content IS NOT NULL AND content != ""`,
    [userId]
  );

  return {
    total: Number(total),
    pinned: Number(pinned),
    archived: Number(archived),
    trashed: Number(trashed),
    tags: Number(tags),
    words: Number(words),
  };
};

module.exports = { getStats };
