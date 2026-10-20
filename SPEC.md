# Club Events · Campus Hub

## Project option
Club events.

## Goals
- A student signs in, views upcoming club events, and registers for an event with available capacity.
- An organizer creates an event with a limited seat capacity and views the list of registered attendees.

## Non-goals
- No payment processing: all club events and workshops are free of charge.
- No email or push notifications: students inspect upcoming schedules directly on the site.
- No native mobile application: single responsive web UI that fits desktop and mobile screens.

## Constraints
- Node.js with Express, SQLite3 (better-sqlite3), vanilla HTML/CSS and client-side JavaScript.
- Passwords are encrypted exclusively with bcrypt, never persisted in plain readable text.
- Must run cleanly inside GitHub Codespaces on Node 22 without external hosted infrastructure for Slice 1.

## The model feature
Model: Gemini 2.5 Flash, vision, invoked via `services/ai.js`.
Input: Event promotional flyer image uploaded by the organizer, containing no member PII.
Output: Suggested JSON containing event title, description, date, location, and capacity for the form.
When it fails: On quota exhaustion, timeout, or missing API key, the form fields remain blank with an inline note prompting manual input. No database write occurs without explicit user submission.

## Auth
Local: Email and password authentication with salted bcrypt hashes and HTTP-only session cookies.
Provider: Sign in with Google using OAuth2 authorization-code flow on the backend server.
Linking: Accounts are linked by verified Google email address. Unverified Google profiles are rejected and never mapped to existing local accounts.

## MCP tools
| Tool | What it does | Who may call it |
| --- | --- | --- |
| `list_upcoming_events` | Returns future club events including free seat capacity and scheduled time. | Anyone |
| `get_my_registrations` | Returns the list of registered events for the currently authenticated member token. | Authenticated member |
| `register_for_event` | Books a confirmed seat for the authenticated member, rejecting requests if full. | Authenticated member |

## UI
Astro or clean server-rendered Express views with minimalist CSS.
Three screens: Sign-in view, upcoming events list with seat badges, and event detail view with attendance toggle.

## Acceptance criteria
- [AC-1] A signed-in member who visits `/events` sees only events whose scheduled date is in the future.
- [AC-2] A member attempting to register for an event with zero remaining seats sees "This event is full", and no record is added to `registrations`.
- [AC-3] An organizer opening an event view sees attendee emails, whereas regular members opening the same view see only the event details.
- [AC-4] A member attempting duplicate registration receives an HTTP 409 error with no duplicate row inserted.
- [AC-5] Signing in via Google using an email that matches an existing local account links the Google profile without creating a new user row.
- [AC-6] Uploading an invalid or missing flyer image in the event creator leaves form fields empty and displays a fallback notice.
- [AC-7] The MCP tool `register_for_event` rejects over-capacity bookings with the exact validation message returned by the REST API.
- [AC-8] Canceling an existing registration immediately increments the free capacity counter and makes the seat available for others.

### Slice 1: sign-in and the upcoming events list
- [AC-9] A visitor who opens `/events` without an active session is redirected to `/login` with an HTTP 302.
- [AC-10] After submitting valid seeded credentials at `/login`, the user lands on `/events` displaying the three seeded events with titles, dates, and available seat counts.
- [AC-11] Deleting one event record from the database and reloading `/events` immediately removes that event from the displayed list.

## Traceability
| Criterion | Test |
| --- | --- |
| AC-1 | (from Exercise 3) |
| AC-9 | Manual check & Slice 1 test |
| AC-10 | Manual check & Slice 1 test |
| AC-11 | Manual check & Slice 1 test |

## Spec vs result
Passed: Local session login, unauthenticated route redirection to `/login`, and dynamic rendering of seeded club events from SQLite.
Missed: The initial query did not enforce chronological ascending ordering for the events list.
Changed: Updated [AC-1] to state "events whose scheduled date is in the future, ordered chronologically".