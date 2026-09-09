import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useJournal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('journal_entries').select('*').order('date', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function saveEntry(date, content) {
    const existing = entries.find((e) => e.date === date)
    const { error } = existing
      ? await supabase
          .from('journal_entries')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      : await supabase.from('journal_entries').insert({ date, content })
    if (error) throw error
    await reload()
  }

  async function deleteEntry(date) {
    const existing = entries.find((e) => e.date === date)
    if (!existing) return
    const { error } = await supabase.from('journal_entries').delete().eq('id', existing.id)
    if (error) throw error
    await reload()
  }

  return { entries, loading, saveEntry, deleteEntry }
}
