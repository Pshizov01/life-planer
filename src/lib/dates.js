export function today() {
  return new Date().toLocaleDateString('en-CA')
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}
