import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const GRID_DAYS = 14

function lastNDates(n) {
  const dates = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toLocaleDateString('en-CA'))
  }
  return dates
}

export function useHabits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const dates = lastNDates(GRID_DAYS)
  const fromDate = dates[dates.length - 1]

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
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, date, done: true })
    }
    await reload()
  }

  async function addHabit(name) {
    const nextOrder = habits.length > 0 ? Math.max(...habits.map((h) => h.sort_order)) + 1 : 0
    await supabase.from('habits').insert({ name, sort_order: nextOrder })
    await reload()
  }

  return { habits, logs, dates, loading, toggleLog, addHabit }
}
