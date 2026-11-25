# TriageSync

## Overview

TriageSync combines a support-ticket triage queue with shared resource scheduling. Support agents can import ticket feeds, review classifications and audit history, and book resources. Administrators can manage the catalog, decide booking requests, and view analytics.

## Live links

- **Public HTTPS demo** — Pending a hosting account connection. The repository includes a [Render Blueprint](render.yaml) for one Node service serving both the built React app and the API.
- **Local frontend** — `http://localhost:5173` in development.
- **Local API** — `http://localhost:5000/api`. The production-mode server also serves the UI at its root.
- **Frontend Live Link** — [TriageSync](engnf1-fullstack-dipesh-2874-qt1o.vercel.app).
- **Backend Live Link** — [TriageSync Backend](https://engnf1-fullstack-dipesh-2874.onrender.com).
- **Source** — [GitHub repository](https://github.com/dipesh-2874/engnf1-fullstack-dipesh-2874).

## Seeded credentials

Use these assessment demo accounts only in a development or dedicated demo database.

- **Support agent** — `user@triagesync.test` / `User@123`
- **Administrator** — `admin@triagesync.test` / `Admin@123`

## Tech stack

- React 19, Vite 7, Tailwind CSS 4, React Router, Axios, and TanStack Query
- Recharts and accessible HTML charts for admin analytics
- Node.js, Express 5, Mongoose, MongoDB, bcrypt, and JWT bearer authentication
- A MongoDB Atlas deployment or local replica set for booking and audit transactions

## Folder structure

```text
.
├── backend/
│   └── src/
│       ├── app.js              Express routes and production frontend serving
│       ├── server.js           Environment, database connection, and listener
│       ├── controllers/        Ticket, resource, booking, and statistics logic
│       ├── middleware/         JWT authentication and role checks
│       ├── models/             MongoDB models and indexes
│       ├── routes/             API route definitions
│       ├── scripts/            Demo seeds and classifier check
│       ├── services/           Ticket classifier
│       └── tests/              Booking race check
├── frontend/
│   └── src/
│       ├── api/                HTTP client and endpoint adapters
│       ├── components/         Forms, charts, and feature controls
│       ├── context/            JWT session and current user
│       ├── hooks/              Queries, mutations, and cache updates
│       ├── layouts/            Auth and dashboard layouts
│       ├── pages/              User and admin screens
│       └── routes/             Navigation and guards
├── render.yaml
├── SOLUTION.md
└── AI_USAGE.md
```

## Local setup and deployment

Use Node.js 22.12 or newer and npm. Copy [`.env.example`](.env.example) to `.env` if needed. Set `MONGO_URI` to your replica-set database URI and replace the dummy `JWT_SECRET` with a long random value. Vite exposes `VITE_API_BASE_URL` to the browser. MongoDB credentials and the JWT secret stay on the server.

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd --prefix backend ci
npm.cmd --prefix frontend ci
```

After setting the environment, seed the database, then start the backend and frontend in separate terminals.

```powershell
npm.cmd --prefix backend run seed
npm.cmd --prefix backend start
npm.cmd --prefix frontend run dev
```

The seed command creates the two demo accounts, six resources, and 18 tickets, including three reviewed tickets and a literal-markup sample. Rerunning it preserves the number of seeded records. Use an empty demo database for the assessment dataset. On macOS or Linux, use `npm` in place of `npm.cmd`.

### Production-mode smoke test

```powershell
$env:VITE_API_BASE_URL = '/api'
$env:SERVE_FRONTEND = 'true'
$env:PORT = '5050'
npm.cmd --prefix frontend run build
npm.cmd --prefix backend start
```

Open `http://localhost:5050/login`. The API health check is `http://localhost:5050/api/health`. Direct visits to app routes use the React index page. Unknown API routes keep a JSON 404 response.

### Render deployment

1. Link the GitHub repository and deploy its root [Blueprint](render.yaml) from `main`. It installs both packages, builds the frontend with `/api` as the public API base, and starts Express on the provider's `PORT`.
2. Set `MONGO_URI` to a dedicated Atlas demo database in Render. The Blueprint generates `JWT_SECRET`. Configure Atlas network access for the service and seed that same database with `npm --prefix backend run seed` from an authorized environment.
3. After the service is live, verify its HTTPS `/api/health` endpoint and open the app in a fresh browser session. Record the issued frontend URL and the same host's `/api` URL above.

The Blueprint uses Render's free web plan, which can sleep when idle. For an evaluation that requires an always-running service, select a plan with that behavior in your hosting account. [Render Blueprint reference](https://render.com/docs/blueprint-spec) · [Render free web service behavior](https://render.com/docs/free)

## Database schema

- **User** — normalized unique email, name, bcrypt password hash, role, timestamps, and a booking lock version.
- **Ticket** — unique external ID, subject, body, original and current categories, priority, status, assignee, review and override flags, and timestamps. The queue sort index is `{ createdAt: -1, _id: -1 }`.
- **TicketEvent** — ticket reference, changed field, prior value, new value, actor, and creation time. This model uses the `tickets_events` collection.
- **Resource** — case-insensitive unique name, type, capacity, description, active flag, timestamps, and a booking lock version.
- **Booking** — resource and owner references, optional ticket reference, UTC time interval, purpose, status, decision note, and timestamps. Compound indexes support overlap and owner lookups.

## API summary

These paths are relative to `/api`. Protected endpoints require an `Authorization: Bearer <token>` header.

- **Auth** — `POST /auth/register`, `POST /auth/login`, and `GET /auth/me`.
- **Tickets** — `POST /tickets/import`, `GET /tickets`, `GET /tickets/:id`, `PATCH /tickets/:id`, and `GET /tickets/:id/events`. Import accepts a raw JSON array. Ticket search accepts `q` with category, priority, and status filters.
- **Resources** — `GET /resources`, `GET /resources/:id`, `GET /resources/:id/availability?date=YYYY-MM-DD`, and admin-only `POST /resources` and `PATCH /resources/:id`.
- **Bookings** — `POST /bookings`, `GET /bookings/my`, and `PATCH /bookings/:id/cancel` for the owner. `GET /bookings` and `PATCH /bookings/:id/approve` or `/reject` require the admin role.
- **Statistics and health** — `GET /stats`, admin-only `GET /admin/stats`, and `GET /health`.

## Completed features and verification

- [x] Registration, login, session restoration, logout, and role-restricted admin routes
- [x] Live ticket statistics, combined filters, pagination, feed re-import, optimistic edits, rollback, and audit history
- [x] Resource catalog, local availability, UTC booking requests, conflict refresh, booking details, and cancellation
- [x] Admin resource management, booking decisions, and analytics
- [x] Idempotent seed checks, production-mode local smoke tests, and booking concurrency checks
- [x] Chrome checks at 375, 768, and 1280 px, including literal markup, expired sessions, and error recovery
- [ ] Public HTTPS deployment and verification on the hosting provider

Run `npm --prefix frontend run lint`, `npm --prefix frontend run build`, and `npm --prefix backend test` from the repository root. The booking race script targets a disposable database through its API server. Set the server origin in `TEST_API_BASE_URL`, a logged-in test account token in `TEST_TOKEN`, and an active resource ID in `TEST_RESOURCE_ID`, then run `npm --prefix backend run test:booking-race`. [Verification results and measurements](SOLUTION.md)

## Known limitations

- The frontend uses the mounted API shapes. The owner list is `/bookings/my` and supplies full details. The admin booking list has no server pagination, so its status, resource, and date filters run in the browser. Ticket events use their own endpoint.
- Availability accepts a UTC calendar date. The frontend combines the UTC dates needed for a local day and its possible cross-midnight bookings.
- The catalog requests active resources. An authenticated direct resource API read can still return an inactive resource. The frontend labels it as unavailable and hides the booking form.
- Resource retirement uses the active flag. Assignee selection supports assigning to yourself or entering a known user ID.
