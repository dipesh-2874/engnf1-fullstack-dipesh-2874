const statusTones = new Map([
  ['APPROVED', 'positive'],
  ['RESOLVED', 'positive'],
  ['IN_PROGRESS', 'info'],
  ['PENDING', 'warning'],
  ['HIGH', 'warning'],
  ['MEDIUM', 'warning'],
  ['REJECTED', 'negative'],
  ['URGENT', 'negative'],
])

export default function StatusBadge({ status, label }) {
  const tone = statusTones.get(status) ?? 'neutral'
  return <span className={`ui-badge ui-badge--${tone}`}>{label ?? (status || 'Unknown').replaceAll('_', ' ')}</span>
}
