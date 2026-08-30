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

  // payload — либо { city, country }, либо { latitude, longitude };
  // сохранение одного варианта очищает другой, чтобы не было рассинхрона.
  async function saveLocation(payload) {
    const row = {
      city: payload.city ?? null,
      country: payload.country ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
    }
    const { error } = settings
      ? await supabase.from('prayer_settings').update(row).eq('user_id', settings.user_id)
      : await supabase.from('prayer_settings').insert(row)
    if (error) throw error
    await reload()
  }

  return { settings, loading, saveLocation }
}
