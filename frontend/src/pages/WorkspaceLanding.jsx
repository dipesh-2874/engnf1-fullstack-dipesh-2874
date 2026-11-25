import EmptyState from '../components/common/EmptyState.jsx'

export default function WorkspaceLanding({ page }) {
  return (
    <>
      <header className="dashboard-page-heading">
        <h1>{page.title ?? page.label}</h1>
        <p>{page.description}</p>
      </header>
      <EmptyState title="This view is in development" icon={page.icon} />
    </>
  )
}
