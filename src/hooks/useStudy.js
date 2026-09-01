import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useStudy() {
  const [goals, setGoals] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [{ data: goalsData }, { data: sessionsData }] = await Promise.all([
      supabase.from('study_goals').select('*').order('created_at', { ascending: false }),
      supabase.from('study_sessions').select('*').order('date', { ascending: false }),
    ])
    setGoals(goalsData ?? [])
    setSessions(sessionsData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addGoal({ title, target, unit }) {
    const { error } = await supabase.from('study_goals').insert({ title, target, unit, progress: 0 })
    if (error) throw error
    await reload()
  }

  async function updateGoalProgress(goalId, progress) {
    const { error } = await supabase.from('study_goals').update({ progress }).eq('id', goalId)
    if (error) throw error
    await reload()
  }

  async function addSession({ date, subject, duration_min }) {
    const { error } = await supabase.from('study_sessions').insert({ date, subject, duration_min })
    if (error) throw error
    await reload()
  }

  async function deleteGoal(goalId) {
    const { error } = await supabase.from('study_goals').delete().eq('id', goalId)
    if (error) throw error
    await reload()
  }

  async function deleteSession(sessionId) {
    const { error } = await supabase.from('study_sessions').delete().eq('id', sessionId)
    if (error) throw error
    await reload()
  }

  return { goals, sessions, loading, addGoal, updateGoalProgress, addSession, deleteGoal, deleteSession }
}
