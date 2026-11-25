import { Toaster } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'
import { useTicket, useTicketEvents, useUpdateTicket } from '../../hooks/useTickets.js'
import { ticketFieldLabel } from '../../utils/constants.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import ErrorState from '../common/ErrorState.jsx'
import Loader from '../common/Loader.jsx'
import Modal from '../common/Modal.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import AuditTimeline from './AuditTimeline.jsx'
import TicketEditForm from './TicketEditForm.jsx'

export default function TicketDetailPanel({ ticketId, onClose }) {
  const { user } = useAuth()
  const ticketQuery = useTicket(ticketId)
  const eventsQuery = useTicketEvents(ticketId)
  const update = useUpdateTicket(ticketId)
  const ticket = ticketQuery.data

  function handleClose() {
    update.reset()
    onClose()
  }

  return (
    <Modal open={Boolean(ticketId)} onClose={handleClose} title="Ticket details" className="ticket-detail-dialog" dismissible={!update.isPending}>
      {ticketId && ticketQuery.isPending && <Loader label="Loading ticket…" />}
      {ticketId && ticketQuery.isError && (
        <ErrorState
          title="Could not load this ticket"
          description={getErrorMessage(ticketQuery.error, 'Please try again.')}
          onRetry={() => ticketQuery.refetch()}
          retrying={ticketQuery.isFetching}
        />
      )}
      {ticket && (
        <>
          <div className="ticket-detail-summary">
            <div className="ticket-detail-tags">
              <span className="ticket-reference">{ticket.externalId}</span>
              <StatusBadge status={ticket.status} label={ticketFieldLabel(ticket.status)} />
              <StatusBadge status={ticket.priority} label={ticketFieldLabel(ticket.priority)} />
            </div>
            <h3>{ticket.subject}</h3>
            <p className="ticket-detail-body">{ticket.body}</p>
            <dl className="ticket-detail-facts">
              <div><dt>Original auto category</dt><dd>{ticketFieldLabel(ticket.autoCategory)}</dd></div>
              <div>
                <dt>Current category</dt>
                <dd>
                  {ticketFieldLabel(ticket.category)}
                  {ticket.isHumanOverride && <span className="ticket-override">Agent override</span>}
                </dd>
              </div>
              <div><dt>Assignee</dt><dd>{ticket.assignee?.name ?? ticket.assigneeId ?? 'Unassigned'}</dd></div>
              <div><dt>Review</dt><dd>{ticket.isReviewed ? 'Reviewed' : 'Needs review'}</dd></div>
            </dl>
          </div>
          <section className="ticket-detail-section" aria-label="Agent review">
            <h3>Agent review</h3>
            {update.isError && (
              <p className="ticket-message ticket-message--error" role="alert">
                {getErrorMessage(update.error, 'Could not save this ticket. Try again.')}
              </p>
            )}
            {update.isSuccess && <p className="ticket-message" role="status">Changes saved.</p>}
            <TicketEditForm key={ticket.id} ticket={ticket} currentUserId={user.id} onSave={update.mutate} saving={update.isPending} />
          </section>
          <AuditTimeline eventsQuery={eventsQuery} />
        </>
      )}
      <Toaster position="bottom-center" />
    </Modal>
  )
}
