import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePrayerSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('prayer_settings').select('*').maybeSingle()
    setSettings(data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function saveLocation({ city, country }) {
    const { error } = settings
      ? await supabase.from('prayer_settings').update({ city, country }).eq('user_id', settings.user_id)
      : await supabase.from('prayer_settings').insert({ city, country })
    if (error) throw error
    await reload()
  }

  return { settings, loading, saveLocation }
}
