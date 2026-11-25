import { ChevronRight } from 'lucide-react'
import { ticketFieldLabel } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import TicketCard from './TicketCard.jsx'

export default function TicketTable({ tickets, onOpen }) {
  return (
    <>
      <table className="ticket-table" aria-label="Support tickets">
        <colgroup><col className="ticket-id-column" /><col /><col className="ticket-category-column" /><col className="ticket-priority-column" /><col className="ticket-status-column" /></colgroup>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Subject</th>
            <th scope="col">Category</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="ticket-reference">{ticket.externalId}</td>
              <th scope="row">
                <Button
                  variant="ghost"
                  className="ticket-open"
                  aria-label={`Open ticket ${ticket.externalId}: ${ticket.subject}`}
                  onClick={() => onOpen(ticket.id)}
                >
                  {ticket.subject}
                  <ChevronRight size={17} aria-hidden="true" />
                </Button>
              </th>
              <td>{ticketFieldLabel(ticket.category)}</td>
              <td><StatusBadge status={ticket.priority} label={ticketFieldLabel(ticket.priority)} /></td>
              <td><StatusBadge status={ticket.status} label={ticketFieldLabel(ticket.status)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="ticket-cards" aria-label="Support tickets">
        {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />)}
      </ul>
    </>
  )
}
