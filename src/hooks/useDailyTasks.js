import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useDailyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: true })
    setTasks(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addTask(date, title) {
    const { error } = await supabase.from('daily_tasks').insert({ date, title })
    if (error) throw error
    await reload()
  }

  async function toggleTask(id, done) {
    const { error } = await supabase.from('daily_tasks').update({ done: !done }).eq('id', id)
    if (error) throw error
    await reload()
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { tasks, loading, addTask, toggleTask, deleteTask }
}
