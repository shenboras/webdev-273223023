const required = ['DATABASE_URL', 'SESSION_SECRET'];
const missing = required.filter((name) => !process.env[name] || !process.env[name].trim());

if (missing.length > 0) {
  console.error(`missing ${missing.join(', ')}: see .env.example`);
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${Number(process.env.PORT) || 3000}`,
};
