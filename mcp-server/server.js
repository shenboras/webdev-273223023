const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'club-events-local-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));


function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect(302, '/login');
  }
  next();
}


app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/events');
  }
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Sign In</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: sans-serif; max-width: 400px; margin: 40px auto; padding: 0 10px;">
      <h2>Club Events Login</h2>
      <p style="color: #666;">Seeded account: <code>member@example.com</code> / <code>password123</code></p>
      <form method="POST" action="/login">
        <div style="margin-bottom: 12px;">
          <label>Email</label><br>
          <input type="email" name="email" required style="width: 100%; padding: 8px; box-sizing: border-box;" value="member@example.com">
        </div>
        <div style="margin-bottom: 12px;">
          <label>Password</label><br>
          <input type="password" name="password" required style="width: 100%; padding: 8px; box-sizing: border-box;" value="password123">
        </div>
        <button type="submit" style="padding: 10px 16px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Sign In</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).send('Invalid credentials. <a href="/login">Try again</a>');
  }
  req.session.userId = user.id;
  req.session.email = user.email;
  res.redirect('/events');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


app.get('/events', requireAuth, (req, res) => {
  const events = db.prepare('SELECT * FROM events').all();
  const eventRows = events.map(e => `
    <li style="border: 1px solid #ddd; margin-bottom: 12px; padding: 12px; border-radius: 6px; list-style: none;">
      <h3 style="margin: 0 0 8px 0;">${e.title}</h3>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${e.date}</p>
      <p style="margin: 4px 0;"><strong>Capacity:</strong> ${e.capacity}</p>
      <p style="margin: 4px 0; color: #555;">${e.description || ''}</p>
      <form method="POST" action="/events/${e.id}/join" style="margin-top: 8px;">
        <button type="submit" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Join Event</button>
      </form>
    </li>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Upcoming Events</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Upcoming Club Events</h2>
        <a href="/logout" style="color: #d00;">Logout</a>
      </div>
      <p>Signed in as: <strong>${req.session.email}</strong></p>
      <ul style="padding: 0;">
        ${eventRows}
      </ul>
    </body>
    </html>
  `);
});


app.post('/events/:id/join', requireAuth, (req, res) => {
  const eventId = req.params.id;
  const userId = req.session.userId;

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).send('Event not found.');
  }

  const existing = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (existing) {
    return res.status(409).send(`Conflict: You are already registered for "${event.title}".`);
  }

  const regCount = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?').get(eventId).count;
  if (regCount >= event.capacity) {
    return res.status(400).send('Bad Request: Event is fully booked.');
  }

  try {
    db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(userId, eventId);
    res.redirect('/events');
  } catch (err) {
    res.status(500).send('Server error.');
  }
});


app.get('/', (req, res) => {
  res.redirect('/events');
});

app.listen(PORT, () => {
  console.log(`Club events listening on http://localhost:${PORT}`);
});