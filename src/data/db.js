const Database = require('better-sqlite3');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../data/app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member'
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT
  );
`);


const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const hash = bcrypt.hashSync('password123', 10);
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
  insertUser.run('member@example.com', hash, 'member');
  insertUser.run('organizer@example.com', hash, 'organizer');

  const insertEvent = db.prepare('INSERT INTO events (title, date, capacity, description) VALUES (?, ?, ?, ?)');
  insertEvent.run('Webdev Workshop', '2026-11-10 14:00', 30, 'Hands-on frontend and backend training.');
  insertEvent.run('AI Hackathon', '2026-11-20 10:00', 50, 'Build LLM apps in teams.');
  insertEvent.run('Career Talk: Cloud Tech', '2026-12-05 18:00', 40, 'Industry speakers discuss modern DevOps.');
}

module.exports = db;