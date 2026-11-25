import { Pencil, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import Input from '../../components/common/Input.jsx'
import Loader from '../../components/common/Loader.jsx'
import Modal from '../../components/common/Modal.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Select from '../../components/common/Select.jsx'
import ResourceForm from '../../components/resources/ResourceForm.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useResources, useSaveResource } from '../../hooks/useResources.js'
import { RESOURCE_TYPES } from '../../utils/constants.js'
import { getErrorMessage } from '../../utils/errorHandler.js'
import '../../styles/admin.css'

const emptyFilters = { q: '', type: '', isActive: '' }

function ResourceList({ filters, searchPending, onEdit, onToggle, onReset }) {
  const [page, setPage] = useState(1)
  const query = useResources(filters, page)

  if (query.isPending) return <Loader label="Loading resources…" />
  if (query.isError && !query.data) {
    return <ErrorState title="Could not load resources" description={getErrorMessage(query.error, 'Please try again.')} onRetry={query.refetch} retrying={query.isFetching} />
  }

  const { resources, pagination } = query.data
  const outOfRange = page > 1 && page > pagination.totalPages
  const filtered = Boolean(filters.q || filters.type || filters.isActive)

  return (
    <section className="scheduling-results" aria-label="Managed resources" aria-busy={query.isFetching}>
      {query.isError && <ErrorState title="Could not refresh resources" description={getErrorMessage(query.error, 'Please try again.')} onRetry={query.refetch} retrying={query.isFetching} />}
      {resources.length === 0 ? (
        <EmptyState
          title={outOfRange ? 'No resources on this page' : filtered ? 'No matching resources' : 'No resources yet'}
          description={filtered || outOfRange ? undefined : 'Create a resource to make it available in the catalog.'}
          action={outOfRange ? <Button variant="secondary" onClick={() => setPage(1)}>Back to first page</Button>
            : filtered && <Button variant="secondary" onClick={onReset}>Clear filters</Button>}
        />
      ) : (
        <>
          <p className="scheduling-muted" role="status">{pagination.total} {pagination.total === 1 ? 'resource' : 'resources'}</p>
          <ul className="admin-resource-list scheduling-surface" aria-label="Resources">
            {resources.map((resource) => (
              <li key={resource.id} className="admin-resource-row">
                <div className="admin-resource-name">
                  <h2>{resource.name}</h2>
                  {resource.description && <p className="scheduling-muted">{resource.description}</p>}
                </div>
                <div className="admin-resource-meta">
                  <span className={`ui-badge ui-badge--${resource.isActive ? 'positive' : 'neutral'}`}>{resource.isActive ? 'Active' : 'Inactive'}</span>
                  <span>{RESOURCE_TYPES[resource.type]} · Capacity {resource.capacity}</span>
                </div>
                <div className="admin-resource-actions">
                  <Button variant="secondary" onClick={() => onEdit(resource)} aria-label={`Edit ${resource.name}`}><Pencil size={15} aria-hidden="true" /> Edit</Button>
                  <Button variant="ghost" onClick={() => onToggle(resource)} aria-label={`${resource.isActive ? 'Deactivate' : 'Activate'} ${resource.name}`}>
                    {resource.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={query.isPlaceholderData || searchPending} />
        </>
      )}
    </section>
  )
}

export default function AdminResources() {
  const [filters, setFilters] = useState(emptyFilters)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const q = useDebounce(filters.q.trim())
  const params = { q: q || undefined, type: filters.type || undefined, isActive: filters.isActive || undefined }
  const mutation = useSaveResource()
  const resource = dialog?.resource
  const editing = dialog?.type === 'form'
  const toggling = dialog?.type === 'toggle'
  const activation = resource?.isActive ? 'Deactivate' : 'Activate'
  const error = mutation.isError ? getErrorMessage(mutation.error, 'Could not save the resource. Please try again.') : undefined

  function changeFilter(event) {
    const { name, value } = event.target
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  function closeDialog() {
    mutation.reset()
    setDialog(null)
  }

  function openDialog(type, item) {
    mutation.reset()
    setDialog({ type, resource: item })
  }

  function save(changes, message) {
    if (mutation.isPending) return
    setNotice('')
    mutation.mutate({ id: resource?.id, changes }, {
      onSuccess() {
        setDialog(null)
        setNotice(message)
      },
    })
  }

  return (
    <div className="scheduling-page">
      <header className="dashboard-page-heading scheduling-heading scheduling-heading--split">
        <div><h1>Manage Resources</h1><p>Create, update, and manage shared resources.</p></div>
        <Button onClick={() => openDialog('form')}><Plus size={17} aria-hidden="true" /> Add resource</Button>
      </header>

      <section className="scheduling-filters scheduling-surface" aria-label="Resource filters">
        <div className="scheduling-search">
          <Input label="Search resources" name="q" type="search" maxLength={100} placeholder="Search by resource name" value={filters.q} onChange={changeFilter} />
          <Search size={17} aria-hidden="true" />
        </div>
        <Select label="Resource type" name="type" value={filters.type} onChange={changeFilter}>
          <option value="">All types</option>
          {Object.entries(RESOURCE_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Select label="Availability" name="isActive" value={filters.isActive} onChange={changeFilter}>
          <option value="">All resources</option><option value="true">Active</option><option value="false">Inactive</option>
        </Select>
        <Button variant="ghost" className="scheduling-filter-reset" disabled={!Object.values(filters).some(Boolean)} onClick={() => setFilters(emptyFilters)}>Clear filters</Button>
      </section>

      {notice && <p className="scheduling-message" role="status">{notice}</p>}
      <ResourceList
        key={JSON.stringify(params)} filters={params} searchPending={q !== filters.q.trim()}
        onEdit={(item) => openDialog('form', item)}
        onToggle={(item) => openDialog('toggle', item)}
        onReset={() => setFilters(emptyFilters)}
      />

      <Modal open={editing} onClose={closeDialog} title={resource ? 'Edit resource' : 'Add resource'} dismissible={!mutation.isPending}>
        {editing && <ResourceForm resource={resource} onSave={(changes) => save(changes, resource ? 'Resource updated.' : 'Resource created.')} onClose={closeDialog} busy={mutation.isPending} error={error} />}
      </Modal>
      <ConfirmDialog
        open={toggling} title={`${activation} resource?`}
        description={resource && (resource.isActive ? `${resource.name} will be hidden from the resource catalog.` : `${resource.name} will be available to book.`)}
        confirmLabel={activation} onClose={closeDialog}
        onConfirm={() => save({ isActive: !resource.isActive }, resource.isActive ? 'Resource deactivated.' : 'Resource activated.')}
        busy={mutation.isPending} error={error} destructive={Boolean(resource?.isActive)}
      />
    </div>
  )
}
