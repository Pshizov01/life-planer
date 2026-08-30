import { useState } from 'react'
import { useClassSchedule } from '../hooks/useClassSchedule'
import { Card } from './Card'
import { GENERIC_ERROR } from '../lib/constants'

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const emptyForm = { day_of_week: '1', start_time: '', end_time: '', subject: '', room: '' }

function formatTime(t) {
  return t ? t.slice(0, 5) : ''
}

export function ClassSchedule() {
  const { items, loading, addClass, deleteClass } = useClassSchedule()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.start_time) return
    try {
      await addClass({ ...form, day_of_week: Number(form.day_of_week), subject: form.subject.trim() })
      setForm({ ...emptyForm, day_of_week: form.day_of_week })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteClass(id)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <Card title="Расписание пар">Загрузка…</Card>

  return (
    <Card title="Расписание пар">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DAY_NAMES.map((dayName, index) => {
          const dayNumber = index + 1
          const dayItems = items.filter((c) => c.day_of_week === dayNumber)
          return (
            <div key={dayNumber}>
              <h4 className="mb-1 text-xs font-medium text-neutral-500">{dayName}</h4>
              <div className="flex flex-col gap-1">
                {dayItems.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-2 py-1.5 text-sm">
                    <div className="min-w-0">
                      <span className="text-neutral-500">{formatTime(c.start_time)}</span>{' '}
                      <span className="truncate">{c.subject}</span>
                      {c.room && <span className="text-neutral-400"> · {c.room}</span>}
                    </div>
                    <button onClick={() => handleDelete(c.id)} className="shrink-0 text-xs text-neutral-400 hover:text-red-600">
                      ✕
                    </button>
                  </div>
                ))}
                {dayItems.length === 0 && <p className="text-xs text-neutral-400">—</p>}
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
        <select
          value={form.day_of_week}
          onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        >
          {DAY_NAMES.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <input
          type="time"
          value={form.end_time}
          onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          placeholder="До"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Предмет"
          className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <input
          value={form.room}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
          placeholder="Аудитория (необязательно)"
          className="w-40 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Добавить
        </button>
      </form>
    </Card>
  )
}
