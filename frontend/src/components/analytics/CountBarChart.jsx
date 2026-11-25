import { useId } from 'react'

const number = new Intl.NumberFormat()

export default function CountBarChart({ title, rows, emptyMessage, tone = 'accent' }) {
  const titleId = useId()
  const max = Math.max(0, ...rows.map(({ value }) => value))

  return (
    <section className="analytics-chart scheduling-surface" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {max > 0 ? (
        <ul className={`analytics-bars analytics-bars--${tone}`}>
          {rows.map(({ id, label, value }) => (
            <li key={id}>
              <div className="analytics-bar-label"><span>{label}</span><strong>{number.format(value)}</strong></div>
              <div className="analytics-bar-track" aria-hidden="true"><div style={{ width: `${value / max * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      ) : <p className="scheduling-muted">{emptyMessage}</p>}
    </section>
  )
}
