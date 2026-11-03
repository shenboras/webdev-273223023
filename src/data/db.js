const test = require('node:test');
const assert = require('node:assert');
const Database = require('better-sqlite3');
const path = require('node:path');

test('AC-1: Registration conflict check', () => {
  const dbPath = path.join(__dirname, '../data/db.js');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      UNIQUE(user_id, event_id)
    );
  `);db.js

  const userId = 999;
  const eventId = 999;


  db.prepare('DELETE FROM registrations WHERE user_id = ? AND event_id = ?').run(userId, eventId);


  db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(userId, eventId);


  assert.throws(() => {
    db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(userId, eventId);
  }, /UNIQUE constraint failed/);


  db.prepare('DELETE FROM registrations WHERE user_id = ? AND event_id = ?').run(userId, eventId);
});