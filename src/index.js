const express = require('express');
const session = require('express-session');
const config = require('./config');
const db = require('./data/db');
const eventsService = require('./services/eventsService');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect(302, '/login');
  }
  next();
}

app.get('/health', async (req, res) => {
  try {
    await db.checkDb();
    res.status(200).json({ status: 'ok', db: 'ok' });
  } catch (err) {
    console.error('health check failed:', err.message);
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

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

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await eventsService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).send('Invalid credentials. <a href="/login">Try again</a>');
    }
    req.session.userId = user.id;
    req.session.email = user.email;
    res.redirect('/events');
  } catch (err) {
    next(err);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/events', requireAuth, async (req, res, next) => {
  try {
    const events = await eventsService.getUpcomingEvents();
    const eventRows = events.map((e) => `
      <li style="border: 1px solid #ddd; margin-bottom: 12px; padding: 12px; border-radius: 6px; list-style: none;">
        <h3 style="margin: 0 0 8px 0;">${e.title}</h3>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${e.date}</p>
        <p style="margin: 4px 0;"><strong>Free Places:</strong> ${e.capacity}</p>
        <p style="margin: 4px 0; color: #555;">${e.description || ''}</p>
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
  } catch (err) {
    next(err);
  }
});

app.get('/', (req, res) => {
  res.redirect('/events');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  const message = status < 500
    ? (err.message || 'That request is not valid.')
    : 'Something went wrong on our side.';
  res.status(status).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`Club events listening on http://localhost:${config.port}`);
});