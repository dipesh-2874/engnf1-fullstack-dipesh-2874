# TriageSync solution

## Part A — Architecture and ticket trace

```text
React + React Router
    |-- AuthProvider -> Axios -> Bearer JWT
    |-- TriageQueue / TicketDetailPanel -> TanStack Query
    |-- Resource and booking views -> TanStack Query
    `-- Admin dashboard -> ticket and admin queries
                              |
                            /api
                              v
Express -> protect / authorizeRoles -> controllers
                    |                       |
                    |                       +-- classifyTicket (import)
                    |                       +-- MongoDB aggregations (stats)
                    |                       `-- MongoDB sessions (review, booking)
                    v
              Mongoose models -> MongoDB replica set
```

1. `ImportFeedModal.readFeed` parses the chosen JSON file or pasted payload and extracts a nonempty array. `useImportTickets` calls `ticketApi.importTickets`, which sends the raw array to `POST /api/tickets/import`. [Feed parser](frontend/src/components/tickets/ImportFeedModal.jsx#L9) · [Import mutation](frontend/src/hooks/useTickets.js#L21) · [HTTP adapter](frontend/src/api/ticketApi.js#L21)
2. `protect` verifies the HS256 token and loads the user from MongoDB. The ticket router allows both authenticated roles to import. The Axios client adds the bearer token and clears the current session on an authenticated 401. [Authentication middleware](backend/src/middleware/authMiddleware.js) · [Axios client](frontend/src/api/axiosInstance.js)
3. `ticketController.importTickets` validates and trims the complete batch and checks duplicate external IDs within it. `classifyTicket` scans subject and body together using ordered keyword rules. On insert, the controller stores the first classification in `autoCategory`, initializes the current category, priority, and OPEN status, and records initial category, priority, and status events. [Import controller](backend/src/controllers/ticketController.js#L46) · [Classifier](backend/src/services/ticketClassifier.js#L31)
4. Successful import invalidates cached ticket queries and statistics. `getTickets` validates the filters, matches search against subject or body using an escaped regular expression, and combines it with the supplied status, category, and priority filters. It sorts by `createdAt` then `_id` descending. Count and paginated rows come from the same filter. [Ticket controller](backend/src/controllers/ticketController.js)
5. `TriageQueue` uses a 300 ms debounced search and a query key containing the filters and page. The API adapter normalizes MongoDB identifiers. Queue and detail components render subject and body as React text. `getTicketStats` aggregates distributions and computes model agreement as the percentage of reviewed tickets whose current category equals their original category. It returns zero when there are no reviewed tickets. [Triage queue](frontend/src/pages/tickets/TriageQueue.jsx#L79) · [Statistics controller](backend/src/controllers/statsController.js#L24)

**Reviewed** means an agent changed the category or changed status from OPEN to another state. Editing only priority or assignee does not mark a ticket reviewed. A category change also sets the human-override flag. [`updateTicket`](backend/src/controllers/ticketController.js) records a field event and saves the modified ticket in one MongoDB transaction. The frontend [`useUpdateTicket`](frontend/src/hooks/useTickets.js#L67) snapshots the ticket and matching cached rows, applies the edit immediately, and restores those snapshots on a failed PATCH. Successful edits refresh the separate audit query.

## Part B — Booking concurrency and protected re-import

**Booking transactions.** [`runTransaction`](backend/src/controllers/bookingController.js#L157) wraps operations in MongoDB's `withTransaction`. During booking creation, the transaction increments a version on the requester and on the active resource. Competing writes to the same requester contend on the requester document. Competing writes to the same resource also contend when the requesters differ. A retried operation reevaluates the booking-count limit and overlap on the new snapshot.

The overlap check uses `existing.startTime < newEnd` and `existing.endTime > newStart` for PENDING and APPROVED bookings. That treats intervals as half-open and permits adjacent bookings. The count check limits a requester to three future active bookings. Cancellation, approval, and rejection also write the resource lock inside a transaction. A successfully cancelled or rejected booking stops blocking availability. The server validates UTC half-hour boundaries, a 30–240 minute duration, and a start within the next 30 days.

**Re-import.** The [unique external ID index](backend/src/models/Ticket.js#L6) prevents duplicate storage. Initial insert writes the original category. A later import updates the text and reclassifies the current category and priority only while the ticket has no human override. The update filter checks the override at write time so a concurrent agent decision can take precedence. If that conditional write no longer matches, the controller updates only the text. A re-import preserves the original category and the existing audit events.

**Verification.** Two isolated ten-request races each returned one `201 Created` and nine `409 Conflict` responses. One run shared a requester. The second alternated between two requesters for one resource. Re-import checks verified a single document per external ID and preservation of original categories, an agent override, and audit history. [Booking race script](backend/src/tests/bookingConcurrency.test.js)

## Part C — Measure first, then optimize

**Endpoint** — `GET /api/tickets?limit=100`, authenticated, page 1, with no optional filters.

**Method** — 5,000 synthetic tickets in an isolated MongoDB Atlas database. Both runs used the same data, API controller, authentication middleware, and Node process on the same desktop. Each condition used six warm-up requests and 30 sequential measured requests. Timing began before the HTTP request and ended after parsing the JSON response. MongoDB `explain("executionStats")` measured the list query separately from the count query.

- **Before** — p50 **179.66 ms**, p95 **243.34 ms**. The plan used a collection scan and blocking sort and examined **5,000 documents**.
- **After** — p50 **166.74 ms**, p95 **247.82 ms**. The plan used an index scan with a limit and examined **100 index keys and 100 documents**.
- **Change** — The [`ticket_queue_order` index](backend/src/models/Ticket.js#L96) on `{ createdAt: -1, _id: -1 }` matches the default queue order. Median response time fell by 12.92 ms, about 7.2%. The p95 was 4.48 ms higher in this run.

The index adds storage and write cost on inserts. The endpoint still performs authentication and a separate count, and the timings include Atlas network latency and JSON decoding. This run demonstrates lower work for the list query with a smaller effect on end-to-end latency.

To repeat the comparison, seed a disposable replica-set database with 5,000 tickets with distinct `createdAt` values, keep the data and controller unchanged, and measure the endpoint first with the named sort index dropped and then after recreating it. Use `db.tickets.find().sort({ createdAt: -1, _id: -1 }).limit(100).explain("executionStats")` in each condition. The index is created automatically by the application model for ordinary use.

## Part D — What I would improve with one more day

- Make initial import and its audit events atomic per ticket and define retry behavior for simultaneous feeds with the same external ID. The current insert and initial event writes are separate. [Initial insert](backend/src/controllers/ticketController.js#L134)
- Move admin booking filters and pagination to the server to reduce the payload as booking history grows. Add a dedicated owner/admin booking-detail endpoint. [Booking listing controller](backend/src/controllers/bookingController.js#L342)
- Enforce catalog visibility for resource reads, including requests made outside the frontend. [Resource list](backend/src/controllers/resourceController.js#L96) · [Resource detail](backend/src/controllers/resourceController.js#L229)

### Final verification

The production build was served by the same Express application configured for Render and exercised against an isolated Atlas database. The seed scripts passed two consecutive runs. The final API checks covered JSON errors, missing routes, role validation, idempotent imports, and both booking races. Chrome checked nine views and the ticket dialog at 375, 768, and 1280 px for horizontal overflow. It also verified literal markup, error and retry, route guards, expired JWTs, and sign-out. Public HTTPS and hosting behavior require a connected deployment target.
