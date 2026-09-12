import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useClassSchedule() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('class_schedule')
      .select('*')
      .order('week', { ascending: true })
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addClass({ week, day_of_week, start_time, end_time, subject, teacher, room }) {
    const { error } = await supabase.from('class_schedule').insert({
      week,
      day_of_week,
      start_time,
      end_time: end_time || null,
      subject,
      teacher: teacher || null,
      room: room || null,
    })
    if (error) throw error
    await reload()
  }

  async function deleteClass(id) {
    const { error } = await supabase.from('class_schedule').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { items, loading, addClass, deleteClass }
}
