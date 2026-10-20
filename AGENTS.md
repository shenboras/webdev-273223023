# Agent Instructions

## Project
Campus Club Events: A student club management portal enabling members to view upcoming schedules, register for limited-capacity workshops, and organizers to publish events.

## Commands
Install: `npm install`
Run: `npm start`
Test: `npm test`
MCP server: `npm run --silent mcp` (tools go through the service layer)

## Conventions
Three layers, and they do not skip each other: `routes/` → `services/` → `data/`. No SQL outside `src/data/`.
## The MCP server
The MCP server exposes tools over this application's data. All MCP tools must go through the service layer (`src/services/`), never calling the database directly.
Business rules go in `src/services/`, and every rule gets a test that names it.
Passwords are stored only as a bcrypt hash, never as readable text. Sessions use secure HTTP-only cookies.

## Always ask before
- Deleting files or dropping database tables
- Installing external npm dependencies not listed in package.json
- Modifying environment secrets or credentials
- Changing port or database file locations
- Refactoring architecture patterns
- Adding non-goal features (payments, notifications, mobile wrappers)
- Committing API keys or credentials to version control
- Disabling security middlewares (CSRF, authentication checks)
- Sending user data to third-party endpoints