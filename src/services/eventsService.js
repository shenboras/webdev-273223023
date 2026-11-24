const bcrypt = require('bcryptjs');
const repo = require('../data/eventsRepo');

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function authenticateUser(email, password) {
  if (!email || !password) {
    return null;
  }
  const user = await repo.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }
  return { id: user.id, email: user.email };
}

async function getUpcomingEvents() {
  return repo.listEvents();
}

async function joinEvent(userId, eventId) {
  const numericEventId = Number(eventId);
  if (!Number.isInteger(numericEventId) || numericEventId <= 0) {
    throw createHttpError(400, 'Invalid event ID.');
  }

  const event = await repo.findEventById(numericEventId);
  if (!event) {
    throw createHttpError(404, 'Event not found.');
  }

  const existing = await repo.findRegistration(userId, numericEventId);
  if (existing) {
    throw createHttpError(409, `Already registered for "${event.title}".`);
  }

  const regCount = await repo.countRegistrations(numericEventId);
  if (regCount >= event.capacity) {
    throw createHttpError(400, 'Event is full.');
  }

  return repo.createRegistration(userId, numericEventId);
}

module.exports = {
  authenticateUser,
  getUpcomingEvents,
  joinEvent,
};