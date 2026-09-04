import { useState } from 'react'
import { ListTodo, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { today, addDays, relativeDayLabel } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { PageHeading } from '../components/PageHeading'

export default function Tasks() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useDailyTasks()
  const [date, setDate] = useState(today())
  const [title, setTitle] = useState('')
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await addTask(date, title.trim())
      setTitle('')
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTask(task.id, task.done)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const dayTasks = tasks.filter((t) => t.date === date)
  const doneCount = dayTasks.filter((t) => t.done).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={ListTodo} color="text-rose-600">
        Задачи
      </PageHeading>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDate(addDays(date, -1))}
            aria-label="Предыдущий день"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">{relativeDayLabel(date)}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 outline-none"
            />
          </div>
          <button
            onClick={() => setDate(addDays(date, 1))}
            aria-label="Следующий день"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {dayTasks.length > 0 && (
          <div className="mt-3">
            <ProgressBar value={doneCount} max={dayTasks.length} />
          </div>
        )}
      </Card>

      <Card>
        <ul className="flex flex-col gap-1">
          {dayTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-1">
              <button
                onClick={() => handleToggle(task)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${
                    task.done ? 'border-rose-600 bg-rose-600 text-white' : 'border-neutral-300 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className={`truncate transition-colors ${task.done ? 'text-neutral-400 line-through' : ''}`}>
                  {task.title}
                </span>
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                aria-label="Удалить задачу"
                className="shrink-0 px-2 text-xs text-neutral-400 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
          {dayTasks.length === 0 && <p className="py-4 text-center text-sm text-neutral-500">На этот день задач нет</p>}
        </ul>

        <form onSubmit={handleAdd} className="mt-3 flex gap-2 border-t border-neutral-200 pt-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Новая задача"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500"
          >
            Добавить
          </button>
        </form>
      </Card>
    </div>
  )
}
