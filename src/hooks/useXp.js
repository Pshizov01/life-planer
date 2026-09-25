import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { totalXp } from '../lib/quests'

async function countRows(query) {
  const { count } = await query
  return count ?? 0
}

export function useXp() {
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const head = { count: 'exact', head: true }
    const [habitLogs, tasksDone, focusSessions, workouts, journalEntries] = await Promise.all([
      countRows(supabase.from('habit_logs').select('id', head)),
      countRows(supabase.from('daily_tasks').select('id', head).eq('done', true)),
      countRows(supabase.from('focus_sessions').select('id', head)),
      countRows(supabase.from('workouts').select('id', head)),
      countRows(supabase.from('journal_entries').select('id', head)),
    ])
    setXp(totalXp({ habitLogs, tasksDone, focusSessions, workouts, journalEntries }))
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { xp, loading, reload }
}
