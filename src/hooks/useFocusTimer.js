import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Активный таймер помодоро хранится на сервере как момент окончания
// (ends_at), а не как "секунд осталось" — так обратный отсчёт всегда
// считается от реального времени и корректно восстанавливается, даже если
// мини-апп был закрыт или телефон заблокирован на всё время сессии.
export function useFocusTimer() {
  const [timer, setTimer] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('focus_timers').select('*').maybeSingle()
    setTimer(data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') reload()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reload])

  async function start(mode, endsAt) {
    const row = { mode, ends_at: endsAt, updated_at: new Date().toISOString() }
    const { error } = timer
      ? await supabase.from('focus_timers').update(row).eq('user_id', timer.user_id)
      : await supabase.from('focus_timers').insert(row)
    if (error) throw error
    await reload()
  }

  async function clear() {
    if (!timer) return
    const { error } = await supabase.from('focus_timers').delete().eq('user_id', timer.user_id)
    if (error) throw error
    await reload()
  }

  return { timer, loading, start, clear, reload }
}
