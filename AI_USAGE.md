# AI usage

## Frontend scaffold

- OpenAI Codex (GPT-6) read Sections 6.5 and 7 of the candidate brief, compared the proposed frontend modules with the Express routes and controller responses, and drafted the folder structure, dependency manifest, palette tokens, and starter configuration.
- Verification example. The initial frontend plan listed a booking detail endpoint and four ticket endpoints. Codex checked the route files and found no `GET /api/bookings/:id` handler and a separate `GET /api/tickets/:id/events` route. The integration notes now reflect the routes that are actually mounted.

## Frontend foundation and authentication

- OpenAI Codex implemented the Axios and TanStack Query setup, responsive authentication screens, JWT session restoration, and role guards. The auth routes and controller were checked to confirm that registration returns a user and login returns a token. The frontend verifies the session and role through `/api/auth/me`.

## Dashboard layout

- OpenAI Codex used the supplied dashboard and responsive references to implement the shared sidebar, navbar, drawer, and UI components. The layout uses the authenticated user's profile and verified role to render navigation.

## Triage Queue and Agent Review

- OpenAI Codex implemented the live queue, feed import, ticket review, and audit timeline. The implementation was checked against the actual backend controller because the brief combines ticket data and history and wraps the import feed. The backend provides a separate events endpoint and receives a raw array.

## Resources and My Bookings

- OpenAI Codex implemented the resource catalog, local availability grid, booking form, and owner bookings and cancellation flows. The controller was checked for UTC half-hour alignment and daily availability coverage. The booking detail dialog uses the full records returned by the owner list endpoint.

## Admin views

- OpenAI Codex implemented resource administration, booking decisions, and analytics charts. The Express controllers were checked to confirm that the admin list returns all bookings and that the admin statistics response supplies booking and resource metrics. The admin dashboard also requests ticket metrics from the agent stats endpoint.

## Final testing, deployment preparation, and documentation

- OpenAI Codex prepared the same-origin production build and Render Blueprint, added the missing demo fixtures, and wrote the root README and solution notes. It ran browser and API checks against isolated Atlas data and measured ticket-list performance before and after adding the queue sort index.
- Verification example. The sort index was evaluated with the same 5,000 tickets and 30 measured requests per condition. The list query examined fewer documents and median latency improved. The p95 was higher in that run, so the write-up reports the measured trade-off without claiming a uniform speedup.
- The final re-import review checked that the override is tested at write time. The implementation preserves the original category and keeps a concurrent agent decision intact. The test data and temporary verification databases were removed after the runs.
