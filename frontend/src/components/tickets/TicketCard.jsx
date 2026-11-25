import { ChevronRight } from 'lucide-react'
import { ticketFieldLabel } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import StatusBadge from '../common/StatusBadge.jsx'

export default function TicketCard({ ticket, onOpen }) {
  return (
    <li className="ticket-card">
      <div className="ticket-card-heading">
        <span className="ticket-reference">{ticket.externalId}</span>
        <Button
          variant="ghost"
          className="ticket-open"
          aria-label={`Open ticket ${ticket.externalId}: ${ticket.subject}`}
          onClick={() => onOpen(ticket.id)}
        >
          {ticket.subject}
          <ChevronRight size={17} aria-hidden="true" />
        </Button>
      </div>
      <div className="ticket-card-tags">
        <span>{ticketFieldLabel(ticket.category)}</span>
        <StatusBadge status={ticket.priority} label={ticketFieldLabel(ticket.priority)} />
        <StatusBadge status={ticket.status} label={ticketFieldLabel(ticket.status)} />
      </div>
    </li>
  )
}
