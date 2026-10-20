# Agent log

One entry per agent session, newest at the bottom. Be honest: what went wrong is the useful part.

<!-- Copy this block for each session:

## YYYY-MM-DD · <short title>
- Goal: Build an MCP server from scratch without frameworks.
- Delegated: Guided implementation of JSON-RPC protocol, handling handshake, tool listing, tool execution, and error handling.
- Checkpoints:
- Went wrong:
- Changed by hand:

--> All 12/12 tests passed, npm script configured, session transcript generated.

## 2026-10-20 · Build slice 1
Goal: sign-in and upcoming club events list, per SPEC.md slice 1
Delegated: database schema with SQLite seed, bcrypt local session auth, protected /events view
Checkpoints: verified login redirect on unauthenticated /events, verified database seeded rows, inspected table with sqlite3
Went wrong: the list initially rendered unordered; added sorting and verified session cookies
Changed by hand: added HTTP-only session cookie protection, verified redirects
