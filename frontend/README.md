# TriageSync frontend

Phases 1–5 provide the frontend foundation, authentication, dashboard shell, Triage Queue, and Agent Review panel. The queue uses live backend data. Resource, booking, and admin feature pages are planned below. Folders waiting for their first source file contain a `.gitkeep` marker.

## Local setup

Use Node.js 20.19+ on the 20.x line or Node.js 22.12+. Start the backend with `npm --prefix backend start`. The Axios client defaults to `http://localhost:5000/api`. To use another API origin, set `VITE_API_BASE_URL` in the root `.env`. Vite exposes variables prefixed with `VITE_` to browser code. [Vite 7 environment variables](https://v7.vite.dev/guide/env-and-mode)

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Dependencies

- React 19 and React DOM render the application. Vite 7 and its React plugin provide development and production builds. ESLint checks JavaScript, JSX, and React Hooks.
- Tailwind CSS 4 and its Vite plugin handle styling. `src/styles/globals.css` defines `#FBFBFB` (base), `#320B01` (highlight), `#004D3A` (accent), and `#121100` (text).
- React Router DOM 7 handles navigation, redirects, and route guards. [React Router 7 documentation](https://reactrouter.com/7.18.7/start/declarative/routing)
- Axios 1 centralizes the API base URL, Bearer headers, and authenticated `401` handling. TanStack React Query 5 loads the authenticated user and provides the cache for later filtered queries and optimistic edits. [TanStack Query optimistic updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
- Recharts 3 and its React 19 peer `react-is` will render analytics. Lucide React provides icons and React Hot Toast provides mutation feedback.
- React state handles dynamic filters, and native `Date` and `Intl` support UTC conversion and local time display.

## Target folders and files

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                 axiosInstance.js, authApi.js, ticketApi.js,
│   │                        resourceApi.js, bookingApi.js, statsApi.js
│   ├── assets/              logo.svg
│   ├── components/
│   │   ├── common/          Button.jsx, Input.jsx, Select.jsx, Modal.jsx,
│   │   │                    StatusBadge.jsx, StatCard.jsx, Pagination.jsx,
│   │   │                    Loader.jsx, EmptyState.jsx, ErrorState.jsx,
│   │   │                    ConfirmDialog.jsx
│   │   ├── layout/          Sidebar.jsx, Navbar.jsx, MobileNav.jsx
│   │   ├── tickets/         TicketStats.jsx, TicketFilters.jsx, TicketTable.jsx,
│   │   │                    TicketCard.jsx, TicketDetailPanel.jsx, TicketEditForm.jsx,
│   │   │                    AuditTimeline.jsx, ImportFeedModal.jsx
│   │   ├── resources/       ResourceCard.jsx, ResourceFilters.jsx, ResourceForm.jsx,
│   │   │                    AvailabilityGrid.jsx, BookingForm.jsx
│   │   ├── bookings/        BookingTable.jsx, BookingCard.jsx, BookingFilters.jsx,
│   │   │                    RejectBookingModal.jsx
│   │   └── analytics/       CategoryChart.jsx, PriorityChart.jsx,
│   │                        BookingStatusChart.jsx, TopResourcesChart.jsx
│   ├── context/             AuthContext.jsx
│   ├── hooks/               useAuth.js, useTickets.js, useResources.js,
│   │                        useBookings.js, useStats.js, useDebounce.js
│   ├── layouts/             AuthLayout.jsx, DashboardLayout.jsx
│   ├── pages/
│   │   ├── auth/            Login.jsx, Register.jsx
│   │   ├── tickets/         TriageQueue.jsx
│   │   ├── resources/       Resources.jsx, ResourceDetail.jsx
│   │   ├── bookings/        MyBookings.jsx
│   │   ├── admin/           AdminDashboard.jsx, AdminResources.jsx, AdminBookings.jsx
│   │   ├── Forbidden.jsx
│   │   └── NotFound.jsx
│   ├── routes/              AppRoutes.jsx, ProtectedRoute.jsx, AdminRoute.jsx, PublicRoute.jsx
│   ├── utils/               constants.js, dateUtils.js, validators.js, errorHandler.js
│   ├── styles/              globals.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── package-lock.json
└── eslint.config.js
```

## Routes and page requirements

- `/login` and `/register` are public. Registration creates a USER account and sends them to sign in. The JWT stays in tab-scoped session storage across reloads and `/auth/me` provides the role. After login, users return to the requested route or open `/tickets` (USER) or `/admin/dashboard` (ADMIN). An authenticated `401` clears the session and query cache. A login-form `401` displays the credential error on the form.
- `/tickets` is available to USER and ADMIN. It shows live statistics including Model Agreement Rate, combined status/category/priority filters, a 300 ms debounced search, and ten tickets per page. Re-Import Feed accepts a JSON file or pasted JSON containing an array of ticket objects or a `{ tickets: [...] }` envelope. The detail panel renders subjects and bodies as text and shows the original and current categories, editable fields, and audit timeline.
- `/resources` and `/resources/:id` are available to USER and ADMIN. Show live resource search, type and minimum capacity filters, and ten results per page. The detail view shows a complete local day and accepts a booking with a purpose and optional ticket link. Use 30-minute UTC-aligned steps, enforce a duration of 30–240 minutes and a future start within 30 days, and send ISO UTC timestamps. Show the server error and refresh availability after a `409`.
- `/my-bookings` is available to USER and ADMIN. Show the current user's bookings, a status filter, and a cancellation confirmation.
- `/admin/dashboard`, `/admin/resources`, and `/admin/bookings` are ADMIN-only. Show live analytics, create/edit/activate/deactivate resources, and filter, approve, or reject bookings. Require a rejection note.
- `/403` handles authenticated permission failures and `/*` is the catch-all 404. Data views need loading, error with retry, and empty states. Check 375 px, 768 px, and 1280 px widths for horizontal overflow.

## API modules and integration notes

The paths below are relative to `/api` and reflect the currently mounted application endpoints. Sections 6.5 and 7 of the brief describe the required UI and the assessment API contract.

- `authApi.js` (3) uses `POST /auth/register`, `POST /auth/login`, and `GET /auth/me`.
- `ticketApi.js` (5) uses `POST /tickets/import`, `GET /tickets`, `GET /tickets/:id`, `PATCH /tickets/:id`, and `GET /tickets/:id/events`. The backend import takes a raw JSON array and returns `imported` and `updated`. Ticket detail and update return `ticket`. Audit events come from the separate events route. To assign a ticket, use Assign to me or enter a known user ID. An empty assignee field unassigns it.
- `resourceApi.js` (5) uses `GET /resources`, `GET /resources/:id`, `POST /resources`, `PATCH /resources/:id`, and `GET /resources/:id/availability`. The collection expects search as `q`. Availability accepts `date=YYYY-MM-DD` and returns blocking intervals in `availability` for that UTC day. For a local calendar day, fetch each intersecting UTC date, combine duplicate intervals, and check overlaps against local slot bounds. Activation and deactivation use `PATCH` with `isActive`.
- `bookingApi.js` (6) uses `POST /bookings`, `GET /bookings/my`, `GET /bookings`, and `PATCH /bookings/:id/cancel`, `/bookings/:id/approve`, and `/bookings/:id/reject`. The list responses are `{ bookings }`. `/bookings/my` supports status, and the admin list returns all bookings for client-side filtering. The brief specifies `/bookings/mine`, paginated lists, and a booking detail endpoint. The current router has no booking detail handler.
- `statsApi.js` (2) uses `GET /stats` and `GET /admin/stats`. The agent response uses `reviewedTickets`, `categoryDistribution`, `priorityDistribution`, and `statusDistribution`. The admin response supplies resource and booking metrics. Ticket charts on the admin dashboard can use the agent stats request.
- Ticket and resource lists return `{ tickets, pagination }` and `{ resources, pagination }`. Normalize per endpoint at the API boundary and account for Mongo `_id` fields when mapping rows.

## Optimistic ticket edits

In `onMutate`, the app cancels relevant fetches, snapshots the ticket detail and matching list rows, and applies the edit immediately. A failed PATCH restores the snapshots, shows a rollback toast, and displays the server message in the panel. A successful PATCH reconciles the returned ticket and refreshes its audit events. Both outcomes refresh ticket queries and statistics so filtered results and counts reflect server state.
