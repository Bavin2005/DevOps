/**
 * Cafeteria timings and status
 * Admin can later manage these via settings
 */

// Weekday: open 8am–3pm, closed weekends
const DEFAULT_OPEN_HOUR = 8  // 8:00 AM
const DEFAULT_CLOSE_HOUR = 15 // 3:00 PM (15:00)

export function getCafeteriaStatus(now = new Date()) {
  const day = now.getDay() // 0=Sun, 6=Sat
  const hour = now.getHours()
  const minute = now.getMinutes()
  const timeInMinutes = hour * 60 + minute
  const openMinutes = DEFAULT_OPEN_HOUR * 60
  const closeMinutes = DEFAULT_CLOSE_HOUR * 60

  const isWeekend = day === 0 || day === 6
  const isWithinHours = timeInMinutes >= openMinutes && timeInMinutes < closeMinutes

  const isOpen = !isWeekend && isWithinHours
  const nextOpen = !isOpen && !isWeekend && timeInMinutes < openMinutes
  const nextClose = isOpen

  const openTime = `${String(DEFAULT_OPEN_HOUR).padStart(2, '0')}:00`
  const closeTime = `${String(DEFAULT_CLOSE_HOUR).padStart(2, '0')}:00`

  let status = isOpen ? 'open' : 'closed'
  let message = isOpen
    ? `Open · Closes at ${closeTime}`
    : isWeekend
      ? 'Closed on weekends'
      : nextOpen
        ? `Closed · Opens at ${openTime}`
        : `Closed · Opens tomorrow at ${openTime}`

  return {
    isOpen,
    status,
    message,
    openTime: `${openTime} – ${closeTime}`,
    days: 'Mon – Fri',
  }
}
