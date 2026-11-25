import { Inbox } from 'lucide-react'

export default function EmptyState({ title, description, icon = Inbox, action, role }) {
  const Icon = icon

  return (
    <section className="ui-empty-state">
      <span className="ui-state-icon"><Icon size={23} aria-hidden="true" /></span>
      <div role={role}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </section>
  )
}
