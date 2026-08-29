import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [{ data: projectsData }, { data: tasksData }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_tasks').select('*').order('sort_order', { ascending: true }),
    ])
    setProjects(projectsData ?? [])
    setTasks(tasksData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function addProject({ title, description }) {
    await supabase.from('projects').insert({ title, description: description || null })
    await reload()
  }

  async function addTask(projectId, title) {
    const existing = tasks.filter((t) => t.project_id === projectId)
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((t) => t.sort_order)) + 1 : 0
    await supabase.from('project_tasks').insert({ project_id: projectId, title, sort_order: nextOrder })
    await reload()
  }

  async function toggleTask(taskId, done) {
    await supabase.from('project_tasks').update({ done: !done }).eq('id', taskId)
    await reload()
  }

  return { projects, tasks, loading, addProject, addTask, toggleTask }
}
