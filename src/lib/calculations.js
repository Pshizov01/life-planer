// logs: [{ date: 'YYYY-MM-DD', done: boolean }, ...] отсортированы от новых к старым
export function habitStreak(logs) {
  let streak = 0
  for (const log of logs) {
    if (!log.done) break
    streak += 1
  }
  return streak
}

export function mondayOf(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA')
}

// entries: [{ date: 'YYYY-MM-DD', value: number }, ...] в любом порядке
// возвращает [{ week: 'YYYY-MM-DD' (понедельник), total: number }] по возрастанию недели
export function sumByWeek(entries) {
  const totals = new Map()
  for (const entry of entries) {
    const week = mondayOf(entry.date)
    totals.set(week, (totals.get(week) ?? 0) + entry.value)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, total]) => ({ week, total }))
}

// Возвращает процент прогресса (0-100), не деля на 0
export function goalProgress(progress, target) {
  if (!target) return 0
  return Math.min(100, Math.round((progress / target) * 100))
}

// entries: [{ category: string, amount: number }, ...]
// возвращает [{ category, total }] по убыванию суммы
export function sumByCategory(entries) {
  const totals = new Map()
  for (const entry of entries) {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount)
  }
  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([category, total]) => ({ category, total }))
}
