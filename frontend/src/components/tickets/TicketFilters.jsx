import { Search } from 'lucide-react'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES, ticketFieldLabel } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import Select from '../common/Select.jsx'

const selectFields = [
  { key: 'status', label: 'Status', all: 'All statuses', options: TICKET_STATUSES },
  { key: 'category', label: 'Category', all: 'All categories', options: TICKET_CATEGORIES },
  { key: 'priority', label: 'Priority', all: 'All priorities', options: TICKET_PRIORITIES },
]

export default function TicketFilters({ search, filters, onSearch, onFilter, onReset }) {
  const hasFilters = search !== '' || Object.values(filters).some(Boolean)

  return (
    <section className="ticket-filters ticket-surface" aria-label="Ticket filters">
      <div className="ticket-search">
        <Input
          label="Search tickets"
          type="search"
          value={search}
          maxLength={100}
          placeholder="Search subject or body"
          onChange={(event) => onSearch(event.target.value)}
        />
        <Search size={17} aria-hidden="true" />
      </div>
      {selectFields.map(({ key, label, all, options }) => (
        <Select key={key} label={label} value={filters[key]} onChange={(event) => onFilter(key, event.target.value)}>
          <option value="">{all}</option>
          {options.map((value) => <option key={value} value={value}>{ticketFieldLabel(value)}</option>)}
        </Select>
      ))}
      <Button className="ticket-filter-reset" variant="ghost" disabled={!hasFilters} onClick={onReset}>Clear filters</Button>
    </section>
  )
}
