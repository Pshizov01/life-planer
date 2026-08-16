import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('workouts').select('*').order('date', { ascending: false })
    setWorkouts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addWorkout({ date, type, duration_min, note }) {
    await supabase.from('workouts').insert({ date, type, duration_min, note: note || null })
    await reload()
  }

  return { workouts, loading, addWorkout }
}
