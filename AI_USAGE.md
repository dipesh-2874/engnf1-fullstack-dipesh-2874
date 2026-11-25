# AI usage

## Frontend scaffold

- OpenAI Codex (GPT-6) read Sections 6.5 and 7 of the candidate brief, compared the proposed frontend modules with the Express routes and controller responses, and drafted the folder structure, dependency manifest, palette tokens, and starter configuration.
- Verification example. The initial frontend plan listed a booking detail endpoint and four ticket endpoints. Codex checked the route files and found no `GET /api/bookings/:id` handler and a separate `GET /api/tickets/:id/events` route. The integration notes now reflect the routes that are actually mounted.

## Frontend foundation and authentication

- OpenAI Codex implemented the Axios and TanStack Query setup, responsive authentication screens, JWT session restoration, and role guards. The auth routes and controller were checked to confirm that registration returns a user and login returns a token. The frontend verifies the session and role through `/api/auth/me`.
