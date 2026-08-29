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
    const { error } = await supabase.from('projects').insert({ title, description: description || null })
    if (error) throw error
    await reload()
  }

  async function deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId)
    if (error) throw error
    await reload()
  }

  async function addTask(projectId, title) {
    const existing = tasks.filter((t) => t.project_id === projectId)
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((t) => t.sort_order)) + 1 : 0
    const { error } = await supabase
      .from('project_tasks')
      .insert({ project_id: projectId, title, sort_order: nextOrder })
    if (error) throw error
    await reload()
  }

  async function toggleTask(taskId, done) {
    const { error } = await supabase.from('project_tasks').update({ done: !done }).eq('id', taskId)
    if (error) throw error
    await reload()
  }

  return { projects, tasks, loading, addProject, deleteProject, addTask, toggleTask }
}
