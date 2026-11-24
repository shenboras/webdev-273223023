const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const repoPath = require.resolve('../src/data/eventsRepo');
const servicePath = require.resolve('../src/services/eventsService');

function loadServiceWithMock(mockRepo) {
  delete require.cache[servicePath];
  require.cache[repoPath] = {
    id: repoPath,
    filename: repoPath,
    loaded: true,
    exports: mockRepo,
  };
  return require('../src/services/eventsService');
}

test('authenticateUser returns user on valid credentials and null otherwise', async () => {
  const passwordHash = bcrypt.hashSync('password123', 4);
  const service = loadServiceWithMock({
    findUserByEmail: async (email) =>
      email === 'member@example.com'
        ? { id: 1, email: 'member@example.com', password_hash: passwordHash }
        : null,
  });

  const valid = await service.authenticateUser('member@example.com', 'password123');
  assert.deepEqual(valid, { id: 1, email: 'member@example.com' });

  const badPass = await service.authenticateUser('member@example.com', 'wrongpass');
  assert.equal(badPass, null);

  const missingEmail = await service.authenticateUser('', 'password123');
  assert.equal(missingEmail, null);
});

test('getUpcomingEvents returns events from repository', async () => {
  const sampleEvents = [{ id: 1, title: 'Club Meetup', date: '2026-12-01', capacity: 10 }];
  const service = loadServiceWithMock({
    listEvents: async () => sampleEvents,
  });

  const result = await service.getUpcomingEvents();
  assert.deepEqual(result, sampleEvents);
});

test('joinEvent handles validation, 404, 409, capacity full, and success', async () => {
  let created = null;
  const service = loadServiceWithMock({
    findEventById: async (id) => {
      if (id === 404) return null;
      if (id === 2) return { id: 2, title: 'Full Workshop', capacity: 1 };
      return { id: 1, title: 'Hack Night', capacity: 5 };
    },
    findRegistration: async (userId, eventId) =>
      userId === 99 && eventId === 1 ? { id: 10 } : null,
    countRegistrations: async (eventId) => (eventId === 2 ? 1 : 0),
    createRegistration: async (userId, eventId) => {
      created = { id: 55, user_id: userId, event_id: eventId };
      return created;
    },
  });

  await assert.rejects(() => service.joinEvent(1, 'abc'), (err) => err.status === 400);
  await assert.rejects(() => service.joinEvent(1, 404), (err) => err.status === 404);
  await assert.rejects(() => service.joinEvent(99, 1), (err) => err.status === 409);
  await assert.rejects(() => service.joinEvent(1, 2), (err) => err.status === 400);

  const reg = await service.joinEvent(1, 1);
  assert.deepEqual(reg, { id: 55, user_id: 1, event_id: 1 });
  assert.deepEqual(created, { id: 55, user_id: 1, event_id: 1 });
});