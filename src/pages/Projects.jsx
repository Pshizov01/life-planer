import { useState } from 'react'
import { FolderKanban } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { PageHeading } from '../components/PageHeading'

const emptyProject = { title: '', description: '' }

function ProjectCard({ project, tasks, onAddTask, onToggleTask, onDelete }) {
  const [taskTitle, setTaskTitle] = useState('')
  const [error, setError] = useState(null)
  const done = tasks.filter((t) => t.done).length

  async function handleAddTask(e) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    try {
      await onAddTask(project.id, taskTitle.trim())
      setTaskTitle('')
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleToggleTask(task) {
    try {
      await onToggleTask(task.id, task.done)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Удалить проект «${project.title}» вместе со всеми задачами?`)) return
    try {
      await onDelete(project.id)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{project.title}</h3>
          {project.description && <p className="mt-1 text-sm text-neutral-500">{project.description}</p>}
        </div>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-red-50 hover:text-red-600"
        >
          Удалить
        </button>
      </div>

      <div className="mt-3">
        <ProgressBar value={done} max={tasks.length || 1} />
      </div>

      <ul className="mt-3 flex flex-col gap-1">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              onClick={() => handleToggleTask(task)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-50"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                  task.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300 text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={task.done ? 'text-neutral-400 line-through' : ''}>{task.title}</span>
            </button>
          </li>
        ))}
        {tasks.length === 0 && <p className="px-2 py-1 text-sm text-neutral-500">Пока нет задач</p>}
      </ul>

      <form onSubmit={handleAddTask} className="mt-3 flex gap-2 border-t border-neutral-200 pt-3">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Новая задача"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-200"
        >
          Добавить
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}

export default function Projects() {
  const { projects, tasks, loading, addProject, deleteProject, addTask, toggleTask } = useProjects()
  const [form, setForm] = useState(emptyProject)
  const [error, setError] = useState(null)

  async function handleAddProject(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      await addProject({ title: form.title.trim(), description: form.description.trim() })
      setForm(emptyProject)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={FolderKanban} color="text-indigo-600">Проекты</PageHeading>

      <Card title="Новый проект">
        <form onSubmit={handleAddProject} className="flex flex-wrap gap-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Название проекта"
            className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Описание (необязательно)"
            className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          tasks={tasks.filter((t) => t.project_id === project.id)}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDelete={deleteProject}
        />
      ))}

      {projects.length === 0 && (
        <Card>
          <p className="text-center text-sm text-neutral-500">Пока нет проектов</p>
        </Card>
      )}
    </div>
  )
}
