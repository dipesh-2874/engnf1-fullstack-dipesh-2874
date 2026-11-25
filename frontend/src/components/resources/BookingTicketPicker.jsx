import { useState } from 'react'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useTickets } from '../../hooks/useTickets.js'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import Loader from '../common/Loader.jsx'
import Pagination from '../common/Pagination.jsx'
import Select from '../common/Select.jsx'

function TicketOptions({ search, selected, onSelect }) {
  const [page, setPage] = useState(1)
  const query = useTickets(search ? { q: search } : {}, page)
  if (query.isPending) return <Loader label="Loading tickets…" />
  if (query.isError) {
    return (
      <div className="booking-ticket-message">
        <p role="alert">Could not load tickets.</p>
        <Button variant="secondary" onClick={() => query.refetch()} disabled={query.isFetching}>Try again</Button>
      </div>
    )
  }

  const { tickets, pagination } = query.data
  const pageHasSelection = tickets.some(({ id }) => id === selected?.id)

  return (
    <>
      <Select label="Support ticket" value={selected?.id ?? ''} onChange={(event) => onSelect(tickets.find(({ id }) => id === event.target.value) ?? null)}>
        <option value="">No linked ticket</option>
        {selected && !pageHasSelection && <option value={selected.id}>{selected.externalId} · {selected.subject}</option>}
        {tickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.externalId} · {ticket.subject}</option>)}
      </Select>
      {tickets.length === 0 && <p className="scheduling-muted">No matching tickets.</p>}
      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={query.isPlaceholderData} />
    </>
  )
}

export default function BookingTicketPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const q = useDebounce(search.trim())

  return (
    <details className="booking-ticket-picker" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{selected ? `Linked ticket ${selected.externalId}` : 'Link a support ticket (optional)'}</summary>
      {open && (
        <div>
          <Input label="Find a support ticket" type="search" maxLength={100} placeholder="Search subject or body" value={search} onChange={(event) => setSearch(event.target.value)} />
          <TicketOptions key={q} search={q} selected={selected} onSelect={onSelect} />
        </div>
      )}
    </details>
  )
}
