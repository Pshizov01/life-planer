import { supabase } from './supabaseClient'

const TABLES = [
  'workouts',
  'study_goals',
  'study_sessions',
  'habits',
  'habit_logs',
  'daily_log',
  'finance_transactions',
  'finance_goals',
  'focus_sessions',
  'projects',
  'project_tasks',
  'class_schedule',
  'prayer_settings',
]

export async function exportAllData() {
  const result = {}
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    result[table] = data ?? []
  }
  return result
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
