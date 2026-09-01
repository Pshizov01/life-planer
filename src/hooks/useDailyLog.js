import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useDailyLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('daily_log').select('*').order('date', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function saveDay(entry) {
    const existing = logs.find((l) => l.date === entry.date)
    const { error } = existing
      ? await supabase.from('daily_log').update(entry).eq('id', existing.id)
      : await supabase.from('daily_log').insert(entry)
    if (error) throw error
    await reload()
  }

  async function deleteDay(date) {
    const existing = logs.find((l) => l.date === date)
    if (!existing) return
    const { error } = await supabase.from('daily_log').delete().eq('id', existing.id)
    if (error) throw error
    await reload()
  }

  return { logs, loading, saveDay, deleteDay }
}
