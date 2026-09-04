export function today() {
  return new Date().toLocaleDateString('en-CA')
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

// monthStr: 'YYYY-MM' -> "Август 2026"
export function monthLabel(monthStr) {
  const d = new Date(`${monthStr}-01T00:00:00`)
  const label = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function addDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toLocaleDateString('en-CA')
}

// 'Сегодня' / 'Вчера' / 'Завтра', иначе "31 августа, пн"
export function relativeDayLabel(dateStr) {
  const t = today()
  if (dateStr === t) return 'Сегодня'

  const diffDays = Math.round(
    (new Date(`${dateStr}T00:00:00`) - new Date(`${t}T00:00:00`)) / 86400000,
  )
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'

  const d = new Date(`${dateStr}T00:00:00`)
  const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
