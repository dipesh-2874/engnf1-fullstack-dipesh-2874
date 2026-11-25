export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="ui-stat-card">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
      {Icon && <span className="ui-stat-icon" aria-hidden="true"><Icon size={21} /></span>}
    </div>
  )
}
