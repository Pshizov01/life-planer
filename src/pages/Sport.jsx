import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import { sumByWeek, groupByMonth } from '../lib/calculations'
import { today, monthLabel } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { PageHeading } from '../components/PageHeading'

const emptyForm = { date: today(), type: '', duration_min: '', note: '' }

function WorkoutHistory({ workouts }) {
  const groups = groupByMonth(workouts)

  if (groups.length === 0) {
    return <p className="py-4 text-center text-neutral-500">Пока нет тренировок</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group, index) => {
        const totalMin = group.items.reduce((sum, w) => sum + w.duration_min, 0)
        return (
          <details key={group.month} open={index === 0} className="group rounded-lg border border-neutral-200">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
              <span>{monthLabel(group.month)}</span>
              <span className="text-xs font-normal text-neutral-500">
                {group.items.length} · {totalMin} мин
              </span>
            </summary>
            <div className="flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
              {group.items.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="shrink-0 text-neutral-500">{w.date}</span>
                  <span className="min-w-0 flex-1 truncate px-1">{w.type}</span>
                  <span className="shrink-0 text-neutral-500">{w.duration_min} мин</span>
                  {w.note && <span className="max-w-[30%] shrink truncate text-neutral-500">{w.note}</span>}
                </div>
              ))}
            </div>
          </details>
        )
      })}
    </div>
  )
}

export default function Sport() {
  const { workouts, loading, addWorkout } = useWorkouts()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const duration = Number(form.duration_min)
    if (!form.type.trim() || !duration || duration <= 0) {
      setError('Укажи тип тренировки и длительность больше 0')
      return
    }
    try {
      await addWorkout({ ...form, type: form.type.trim(), duration_min: duration })
      setForm({ ...emptyForm, date: form.date })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const weekly = sumByWeek(workouts.map((w) => ({ date: w.date, value: w.duration_min })))

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={Dumbbell} color="text-teal-600">Спорт</PageHeading>

      <Card title="Длительность по неделям, мин">
        {weekly.length > 0 ? (
          <ChartWrapper
            type="bar"
            labels={weekly.map((w) => w.week)}
            data={weekly.map((w) => w.total)}
            label="Минуты"
          />
        ) : (
          <p className="text-sm text-neutral-500">Пока нет данных</p>
        )}
      </Card>

      <Card title="Добавить тренировку">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder="Тип (например, силовая)"
            className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            min="1"
            value={form.duration_min}
            onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
            placeholder="Мин"
            className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Заметка (необязательно)"
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

      <Card title="История по месяцам">
        <WorkoutHistory workouts={workouts} />
      </Card>
    </div>
  )
}
