import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useClassSchedule } from '../hooks/useClassSchedule'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { PageHeading } from '../components/PageHeading'

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const emptyForm = { week: 1, day_of_week: 1, start_time: '', end_time: '', subject: '', teacher: '', room: '' }

export default function Study() {
  const { items, loading, addClass, deleteClass } = useClassSchedule()
  const [week, setWeek] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.start_time) return
    try {
      await addClass({
        week: Number(form.week),
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        subject: form.subject.trim(),
        teacher: form.teacher.trim(),
        room: form.room.trim(),
      })
      setForm({ ...emptyForm, week: form.week, day_of_week: form.day_of_week })
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

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const weekItems = items.filter((c) => c.week === week)

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={BookOpen} color="text-sky-600">Учёба</PageHeading>

      <div className="flex gap-2">
        {[1, 2].map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              week === w ? 'bg-sky-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {w}-я неделя
          </button>
        ))}
      </div>

      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
        const dayItems = weekItems
          .filter((c) => c.day_of_week === day)
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
        if (dayItems.length === 0) return null
        return (
          <Card key={day} title={DAY_LABELS[day - 1]}>
            <ul className="flex flex-col gap-2">
              {dayItems.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">
                      {c.start_time.slice(0, 5)}
                      {c.end_time ? `–${c.end_time.slice(0, 5)}` : ''} · {c.subject}
                    </p>
                    {(c.teacher || c.room) && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {c.teacher}
                        {c.teacher && c.room ? ' · ' : ''}
                        {c.room}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-red-50 hover:text-red-600"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )
      })}

      {weekItems.length === 0 && (
        <Card>
          <p className="text-center text-sm text-neutral-500">На {week}-й неделе пар нет</p>
        </Card>
      )}

      <Card title="Добавить пару">
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={form.week}
              onChange={(e) => setForm({ ...form, week: e.target.value })}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
            >
              <option value={1}>1-я неделя</option>
              <option value={2}>2-я неделя</option>
            </select>
            <select
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={label} value={i + 1}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
            />
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
            />
          </div>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Предмет"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
          />
          <input
            value={form.teacher}
            onChange={(e) => setForm({ ...form, teacher: e.target.value })}
            placeholder="Преподаватель (необязательно)"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
          />
          <input
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder="Аудитория (необязательно)"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Добавить
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>
    </div>
  )
}
