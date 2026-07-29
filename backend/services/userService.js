const { pool } = require('../db');
const bcrypt = require('bcryptjs');

const createUser = async ({ name, email, password }) => {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [result.insertId]);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

module.exports = { createUser, findUserByEmail, findUserById };
