import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useFinance() {
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [{ data: txData }, { data: goalsData }] = await Promise.all([
      supabase.from('finance_transactions').select('*').order('date', { ascending: false }),
      supabase.from('finance_goals').select('*').order('created_at', { ascending: false }),
    ])
    setTransactions(txData ?? [])
    setGoals(goalsData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addTransaction({ date, type, category, amount, note }) {
    await supabase.from('finance_transactions').insert({ date, type, category, amount, note: note || null })
    await reload()
  }

  async function addGoal({ title, target_amount, target_date }) {
    await supabase.from('finance_goals').insert({ title, target_amount, target_date: target_date || null, current_amount: 0 })
    await reload()
  }

  async function updateGoalAmount(goalId, current_amount) {
    await supabase.from('finance_goals').update({ current_amount }).eq('id', goalId)
    await reload()
  }

  return { transactions, goals, loading, addTransaction, addGoal, updateGoalAmount }
}
