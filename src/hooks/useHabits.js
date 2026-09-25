import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { mondayOf } from '../lib/calculations'

// Календарная неделя Пн -> Вс. По умолчанию текущая — пересчитывается
// каждый рендер от реальной даты, поэтому в понедельник сама сдвигается
// на следующую неделю без отдельного планировщика.
export function weekDates(monday) {
  const d = new Date(`${monday}T00:00:00`)
  const dates = []
  for (let i = 0; i < 7; i++) {
    dates.push(d.toLocaleDateString('en-CA'))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function useHabits(weekStart) {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const dates = weekDates(weekStart ?? mondayOf(new Date().toLocaleDateString('en-CA')))
  const fromDate = dates[0]
  const toDate = dates[6]

  const reload = useCallback(async () => {
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from('habits').select('*').order('sort_order', { ascending: true }),
      supabase.from('habit_logs').select('*').gte('date', fromDate).lte('date', toDate),
    ])
    setHabits(habitsData ?? [])
    setLogs(logsData ?? [])
    setLoading(false)
  }, [fromDate, toDate])

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

  async function deleteHabit(habitId) {
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (error) throw error
    await reload()
  }

  return { habits, logs, dates, loading, toggleLog, addHabit, deleteHabit }
}
