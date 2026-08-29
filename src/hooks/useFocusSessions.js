import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { today } from '../lib/dates'

export function useFocusSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('focus_sessions').select('*').order('date', { ascending: true })
    setSessions(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function logSession(duration_min) {
    const { error } = await supabase.from('focus_sessions').insert({ date: today(), duration_min })
    if (error) throw error
    await reload()
  }

  return { sessions, loading, logSession }
}
