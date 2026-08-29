import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { mondayOf } from '../lib/calculations'

// Текущая календарная неделя, Пн -> Вс (по возрастанию). Пересчитывается
// каждый рендер от реальной даты, поэтому в понедельник сама сдвигается
// на следующую неделю — без отдельного планировщика.
function currentWeekDates() {
  const monday = mondayOf(new Date().toLocaleDateString('en-CA'))
  const d = new Date(`${monday}T00:00:00`)
  const dates = []
  for (let i = 0; i < 7; i++) {
    dates.push(d.toLocaleDateString('en-CA'))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function useHabits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const dates = currentWeekDates()
  const fromDate = dates[0]

  const reload = useCallback(async () => {
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from('habits').select('*').order('sort_order', { ascending: true }),
      supabase.from('habit_logs').select('*').gte('date', fromDate),
    ])
    setHabits(habitsData ?? [])
    setLogs(logsData ?? [])
    setLoading(false)
  }, [fromDate])

  useEffect(() => {
    reload()
  }, [reload])

  async function toggleLog(habitId, date) {
    const existing = logs.find((l) => l.habit_id === habitId && l.date === date)
    const { error } = existing
      ? await supabase.from('habit_logs').delete().eq('id', existing.id)
      : await supabase.from('habit_logs').insert({ habit_id: habitId, date, done: true })
    if (error) throw error
    await reload()
  }

  async function addHabit(name) {
    const nextOrder = habits.length > 0 ? Math.max(...habits.map((h) => h.sort_order)) + 1 : 0
    const { error } = await supabase.from('habits').insert({ name, sort_order: nextOrder })
    if (error) throw error
    await reload()
  }

  return { habits, logs, dates, loading, toggleLog, addHabit }
}
