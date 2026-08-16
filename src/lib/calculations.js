// logs: [{ date: 'YYYY-MM-DD', done: boolean }, ...] отсортированы от новых к старым
export function habitStreak(logs) {
  let streak = 0
  for (const log of logs) {
    if (!log.done) break
    streak += 1
  }
  return streak
}
