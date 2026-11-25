import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Loader from '../../components/common/Loader.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import ImportFeedModal from '../../components/tickets/ImportFeedModal.jsx'
import TicketDetailPanel from '../../components/tickets/TicketDetailPanel.jsx'
import TicketFilters from '../../components/tickets/TicketFilters.jsx'
import TicketStats from '../../components/tickets/TicketStats.jsx'
import TicketTable from '../../components/tickets/TicketTable.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useTickets } from '../../hooks/useTickets.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/tickets.css'

const emptyFilters = { status: '', category: '', priority: '' }

function TicketResults({ filters, searchPending, onReset, onOpen }) {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useTickets(filters, page)

  if (isPending) return <div className="ticket-surface"><Loader label="Loading tickets…" /></div>
  if (isError && !data) {
    return (
      <ErrorState
        title="Could not load tickets"
        description={getErrorMessage(error, 'Please try again.')}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    )
  }

  const { tickets, pagination } = data
  const hasFilters = Object.keys(filters).length > 0
  const outOfRange = page > 1 && page > pagination.totalPages
  const first = (pagination.page - 1) * pagination.limit + 1
  const last = first + tickets.length - 1
  const emptyTitle = hasFilters ? 'No matching tickets' : 'No tickets yet'
  const emptyDescription = hasFilters ? 'Try a different search or clear the filters.' : 'Import a feed to add tickets to the queue.'

  return (
    <section className="ticket-results ticket-surface" aria-label="Ticket results" aria-busy={isFetching}>
      <div className="ticket-results-header">
        <h2>Support tickets</h2>
        {isFetching && <span role="status" className="ticket-muted">Updating…</span>}
      </div>

      {isError && (
        <div className="ticket-results-retry">
          <p className="ticket-message ticket-message--error" role="alert">{getErrorMessage(error, 'Could not refresh tickets.')}</p>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>Try again</Button>
        </div>
      )}

      {tickets.length ? <TicketTable tickets={tickets} onOpen={onOpen} /> : (
        <EmptyState
          title={outOfRange ? 'No tickets on this page' : emptyTitle}
          description={outOfRange ? undefined : emptyDescription}
          action={outOfRange
            ? <Button variant="secondary" onClick={() => setPage(1)}>Back to first page</Button>
            : hasFilters && <Button variant="secondary" onClick={onReset}>Clear filters</Button>}
        />
      )}

      {tickets.length > 0 && (
        <div className="ticket-results-footer">
          <p className="ticket-muted">Showing {first}–{last} of {pagination.total}</p>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={isPlaceholderData || searchPending} />
        </div>
      )}
    </section>
  )
}

export default function TriageQueue() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const q = useDebounce(search.trim())
  const params = Object.fromEntries(Object.entries({ ...filters, q }).filter(([, value]) => value))

  function resetFilters() {
    setSearch('')
    setFilters(emptyFilters)
  }

  return (
    <div className="ticket-queue">
      <header className="dashboard-page-heading ticket-page-heading">
        <div>
          <h1>Triage Queue</h1>
          <p>Review, prioritize, and manage incoming support tickets.</p>
        </div>
        <Button onClick={() => setImportOpen(true)}><RefreshCw size={17} aria-hidden="true" /> Re-Import Feed</Button>
      </header>
      <TicketStats />
      <TicketFilters
        search={search}
        filters={filters}
        onSearch={setSearch}
        onFilter={(key, value) => setFilters((previous) => ({ ...previous, [key]: value }))}
        onReset={resetFilters}
      />
      <TicketResults
        key={JSON.stringify(params)}
        filters={params}
        searchPending={q !== search.trim()}
        onReset={resetFilters}
        onOpen={setSelectedTicketId}
      />
      <ImportFeedModal open={importOpen} onClose={() => setImportOpen(false)} />
      <TicketDetailPanel ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
    </div>
  )
}
