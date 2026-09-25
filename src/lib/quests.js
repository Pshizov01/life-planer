import { goalProgress } from './calculations.js'

export const XP = { habit: 10, task: 15, focus: 20, workout: 25, journal: 15 }

// Каждый следующий уровень требует на 100 XP больше предыдущего.
export function levelFromXp(xp) {
  let level = 1
  let current = xp
  let needed = 100
  while (current >= needed) {
    current -= needed
    level += 1
    needed = 100 * level
  }
  return { level, current, needed }
}

export function totalXp({ habitLogs, tasksDone, focusSessions, workouts, journalEntries }) {
  return (
    habitLogs * XP.habit +
    tasksDone * XP.task +
    focusSessions * XP.focus +
    workouts * XP.workout +
    journalEntries * XP.journal
  )
}

export function dayXp(habitsDone, tasksDone) {
  return habitsDone * XP.habit + tasksDone * XP.task
}

// days: [{ date, done, total }] — дни без квестов не участвуют в статистике.
export function weekSummary(days) {
  const counted = days.filter((d) => d.total > 0)
  const total = counted.reduce((sum, d) => sum + d.total, 0)
  const done = counted.reduce((sum, d) => sum + d.done, 0)
  if (counted.length === 0) return { total, done, missed: 0, avgPct: 0, best: null, worst: null }

  const withPct = counted.map((d) => ({ date: d.date, pct: goalProgress(d.done, d.total) }))
  let best = withPct[0]
  let worst = withPct[0]
  for (const d of withPct) {
    if (d.pct > best.pct) best = d
    if (d.pct < worst.pct) worst = d
  }
  const avgPct = Math.round(withPct.reduce((sum, d) => sum + d.pct, 0) / withPct.length)

  return { total, done, missed: total - done, avgPct, best: best.date, worst: worst.date }
}

// Привычка, заведённая позже этого дня, не должна считаться в нём проваленной.
export function habitsActiveOn(habits, date) {
  return habits.filter((h) => !h.created_at || new Date(h.created_at).toLocaleDateString('en-CA') <= date)
}

export function dayRank(pct) {
  if (pct >= 100) return 'Идеальный день'
  if (pct >= 80) return 'Почти идеально'
  if (pct >= 50) return 'Хороший темп'
  if (pct > 0) return 'Разминка'
  return 'Квесты ждут'
}
