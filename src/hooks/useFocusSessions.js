import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function today() {
  return new Date().toLocaleDateString('en-CA')
}

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
    await supabase.from('focus_sessions').insert({ date: today(), duration_min })
    await reload()
  }

  return { sessions, loading, logSession }
}
