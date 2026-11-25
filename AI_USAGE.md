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
