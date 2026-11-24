const { pool } = require('./db');

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function listEvents() {
  const { rows } = await pool.query(
    'SELECT id, title, date, capacity, description FROM events ORDER BY id ASC'
  );
  return rows;
}

async function findEventById(eventId) {
  const { rows } = await pool.query(
    'SELECT id, title, date, capacity, description FROM events WHERE id = $1',
    [eventId]
  );
  return rows[0] || null;
}

async function findRegistration(userId, eventId) {
  const { rows } = await pool.query(
    'SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2',
    [userId, eventId]
  );
  return rows[0] || null;
}

async function countRegistrations(eventId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM registrations WHERE event_id = $1',
    [eventId]
  );
  return rows[0] ? rows[0].count : 0;
}

async function createRegistration(userId, eventId) {
  const { rows } = await pool.query(
    'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING id, user_id, event_id',
    [userId, eventId]
  );
  return rows[0];
}

module.exports = {
  findUserByEmail,
  listEvents,
  findEventById,
  findRegistration,
  countRegistrations,
  createRegistration,
};