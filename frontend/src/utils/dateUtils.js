export const SLOT_MS = 30 * 60 * 1000
export const MAX_BOOKING_SLOTS = 8
const DAY_MS = 24 * 60 * 60 * 1000
export const BOOKING_HORIZON_MS = 30 * DAY_MS

const calendar = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const clock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const zonedClock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })

export function localDateValue(timestamp) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function localDayBounds(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const utc = Date.parse(`${date}T00:00:00Z`)
  if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0, 10) !== date) return null

  const nextDate = new Date(utc + DAY_MS).toISOString().slice(0, 10)
  const start = Date.parse(`${date}T00:00:00`)
  const end = Date.parse(`${nextDate}T00:00:00`)
  return end > start ? { start, end } : null
}

export function availabilityUtcDates(day) {
  const dates = []
  const firstUtcDay = Math.floor(day.start / DAY_MS) * DAY_MS
  const lastSlotStart = (Math.ceil(day.end / SLOT_MS) - 1) * SLOT_MS
  const coverageEnd = lastSlotStart + MAX_BOOKING_SLOTS * SLOT_MS

  for (let dayStart = firstUtcDay; dayStart < coverageEnd; dayStart += DAY_MS) {
    dates.push(new Date(dayStart).toISOString().slice(0, 10))
  }
  return dates
}

export function overlapsAvailability(start, end, intervals) {
  return intervals.some((interval) => start < interval.end && end > interval.start)
}

export function availabilitySlots(day, intervals, now) {
  const slots = []
  const firstSlot = Math.floor(day.start / SLOT_MS) * SLOT_MS

  for (let start = firstSlot; start < day.end; start += SLOT_MS) {
    const visibleStart = Math.max(start, day.start)
    const visibleEnd = Math.min(start + SLOT_MS, day.end)
    let state = 'Available'
    if (overlapsAvailability(start, start + SLOT_MS, intervals)) state = 'Booked'
    else if (start <= now) state = 'Past'
    else if (start < day.start || start > now + BOOKING_HORIZON_MS) state = 'Unavailable'
    slots.push({ start, visibleStart, visibleEnd, state })
  }
  return slots
}

export function bookingEndOptions(start, intervals) {
  const ends = []
  for (let step = 1; step <= MAX_BOOKING_SLOTS; step += 1) {
    const end = start + step * SLOT_MS
    if (overlapsAvailability(start, end, intervals)) break
    ends.push(end)
  }
  return ends
}

export function formatLocalDate(timestamp) {
  return calendar.format(new Date(timestamp))
}

export function formatLocalTime(timestamp, includeZone = false) {
  return (includeZone ? zonedClock : clock).format(new Date(timestamp))
}

export function formatBookingRange(startTime, endTime) {
  const endDate = localDateValue(startTime) === localDateValue(endTime) ? '' : `${formatLocalDate(endTime)}, `
  const offsetChanges = new Date(startTime).getTimezoneOffset() !== new Date(endTime).getTimezoneOffset()
  return `${formatLocalDate(startTime)}, ${formatLocalTime(startTime, offsetChanges)} – ${endDate}${formatLocalTime(endTime, true)}`
}
