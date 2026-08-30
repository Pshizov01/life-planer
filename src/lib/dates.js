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
