import { Clock3 } from 'lucide-react'
import { ticketFieldLabel } from '../../utils/constants.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const eventLabels = { category: 'Category', priority: 'Priority', status: 'Status', assigneeId: 'Assignee' }

function formatValue(field, value) {
  if (field === 'assigneeId') return value ?? 'Unassigned'
  return value ? ticketFieldLabel(value) : 'None'
}

export default function AuditTimeline({ eventsQuery }) {
  const { data: events, isPending, isError, error, isFetching, refetch } = eventsQuery

  return (
    <section className="ticket-detail-section" aria-label="Audit history" aria-busy={isFetching}>
      <h3><Clock3 size={17} aria-hidden="true" /> Audit history</h3>
      {isPending && <Loader label="Loading audit history…" />}
      {isError && (
        <div className="ticket-audit-retry">
          <p className="ticket-message ticket-message--error" role="alert">{getErrorMessage(error, 'Could not load audit history.')}</p>
          <Button variant="secondary" disabled={isFetching} onClick={() => refetch()}>Try again</Button>
        </div>
      )}
      {events?.length === 0 && <p className="ticket-muted">No audit events yet.</p>}
      {events?.length > 0 && (
        <ol className="ticket-audit-list">
          {events.map((event) => (
            <li key={event.id}>
              <h4>{eventLabels[event.field] ?? event.field} updated</h4>
              <p>{formatValue(event.field, event.oldValue)} <span aria-label="to">→</span> {formatValue(event.field, event.newValue)}</p>
              <p className="ticket-muted">{event.actor} · <time dateTime={event.createdAt}>{dateTime.format(new Date(event.createdAt))}</time></p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
