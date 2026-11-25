import { useState } from 'react'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Loader from '../../components/common/Loader.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import ResourceCard from '../../components/resources/ResourceCard.jsx'
import ResourceFilters from '../../components/resources/ResourceFilters.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useResources } from '../../hooks/useResources.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/scheduling.css'

function validCapacity(value) {
  const number = Number(value)
  return value === '' || (Number.isInteger(number) && number >= 1 && number <= 500)
}

function ResourceResults({ filters, filtersPending, onClear }) {
  const [page, setPage] = useState(1)
  const query = useResources(filters, page)
  const hasFilters = Boolean(filters.q || filters.type || filters.minCapacity)

  if (query.isPending) return <Loader label="Loading resources…" />
  if (query.isError && !query.data) {
    return <ErrorState title="Could not load resources" description={getErrorMessage(query.error, 'Please try again.')} onRetry={query.refetch} retrying={query.isFetching} />
  }

  const { resources, pagination } = query.data
  const outOfRange = page > 1 && page > pagination.totalPages

  return (
    <section className="scheduling-results" aria-label="Resource results" aria-busy={query.isFetching}>
      {query.isError && <ErrorState title="Could not refresh resources" description={getErrorMessage(query.error, 'Please try again.')} onRetry={query.refetch} retrying={query.isFetching} />}
      {resources.length === 0 ? (
        <EmptyState
          title={outOfRange ? 'No resources on this page' : hasFilters ? 'No matching resources' : 'No resources available'}
          description={hasFilters && !outOfRange ? 'Try a different search or clear the filters.' : undefined}
          action={outOfRange ? <Button variant="secondary" onClick={() => setPage(1)}>Back to first page</Button>
            : hasFilters && <Button variant="secondary" onClick={onClear}>Clear filters</Button>}
        />
      ) : (
        <>
          <p className="scheduling-muted" role="status">{pagination.total} {pagination.total === 1 ? 'resource' : 'resources'}</p>
          <ul className="resource-grid" aria-label="Resources">
            {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
          </ul>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={query.isPlaceholderData || filtersPending} />
        </>
      )}
    </section>
  )
}

export default function Resources() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [capacity, setCapacity] = useState('')
  const q = useDebounce(search.trim())
  const minCapacity = useDebounce(capacity)
  const capacityError = validCapacity(capacity) ? undefined : 'Enter a whole number from 1 to 500.'
  const filters = { isActive: true, q: q || undefined, type: type || undefined, minCapacity: minCapacity || undefined }

  function clearFilters() {
    setSearch('')
    setType('')
    setCapacity('')
  }

  return (
    <div className="scheduling-page">
      <header className="dashboard-page-heading scheduling-heading">
        <h1>Resources</h1>
        <p>Browse shared resources and find an available time slot.</p>
      </header>
      <ResourceFilters
        search={search} type={type} capacity={capacity} capacityError={capacityError}
        onSearch={setSearch} onType={setType} onCapacity={setCapacity} onClear={clearFilters}
      />
      {!capacityError && (validCapacity(minCapacity) ? (
        <ResourceResults key={JSON.stringify(filters)} filters={filters} filtersPending={q !== search.trim() || minCapacity !== capacity} onClear={clearFilters} />
      ) : <Loader label="Applying resource filters…" />)}
    </div>
  )
}
