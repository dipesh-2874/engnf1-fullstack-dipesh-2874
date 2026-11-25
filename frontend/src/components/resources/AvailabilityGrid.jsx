import { formatLocalTime } from '../../utils/dateUtils.js'

export default function AvailabilityGrid({ slots, selectedStart, selectedEnd, onSelect, disabled }) {
  const showZone = new Set(slots.map((slot) => new Date(slot.visibleStart).getTimezoneOffset())).size > 1

  return (
    <ul className="availability-grid" aria-label="Daily availability" tabIndex={0}>
      {slots.map((slot) => {
        const time = formatLocalTime(slot.visibleStart, showZone)
        const description = `${formatLocalTime(slot.visibleStart, true)} to ${formatLocalTime(slot.visibleEnd, true)}, ${slot.state}`
        const selected = selectedStart !== null && slot.start >= selectedStart && slot.start < selectedEnd

        return (
          <li key={slot.start}>
            <button
              type="button"
              className={`availability-slot availability-slot--${slot.state.toLowerCase()}`}
              aria-label={description}
              aria-pressed={selected}
              disabled={disabled || slot.state !== 'Available'}
              onClick={() => onSelect(slot.start)}
            >
              <time dateTime={new Date(slot.visibleStart).toISOString()}>{time}</time>
              <span>{selected ? 'Selected' : slot.state}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
