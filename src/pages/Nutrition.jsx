import { useEffect, useState } from 'react'
import { Utensils } from 'lucide-react'
import { useDailyLog } from '../hooks/useDailyLog'
import { today } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { PageHeading } from '../components/PageHeading'

const emptyForm = { weight_kg: '', meals_count: '', water_glasses: '', sleep_hours: '', plan_score: '' }

function toNullableNumber(value) {
  return value === '' ? null : Number(value)
}

export default function Nutrition() {
  const { logs, loading, saveDay } = useDailyLog()
  const [date, setDate] = useState(today())
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)

  useEffect(() => {
    const existing = logs.find((l) => l.date === date)
    setForm(
      existing
        ? {
            weight_kg: existing.weight_kg ?? '',
            meals_count: existing.meals_count ?? '',
            water_glasses: existing.water_glasses ?? '',
            sleep_hours: existing.sleep_hours ?? '',
            plan_score: existing.plan_score ?? '',
          }
        : emptyForm,
    )
  }, [date, logs])

  async function handleSubmit(e) {
    e.preventDefault()
    const score = toNullableNumber(form.plan_score)
    if (score !== null && (score < 1 || score > 5)) {
      setError('Оценка должна быть от 1 до 5')
      return
    }
    try {
      await saveDay({
        date,
        weight_kg: toNullableNumber(form.weight_kg),
        meals_count: toNullableNumber(form.meals_count),
        water_glasses: toNullableNumber(form.water_glasses),
        sleep_hours: toNullableNumber(form.sleep_hours),
        plan_score: score,
      })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const weightSeries = logs.filter((l) => l.weight_kg != null)
  const sleepSeries = logs.filter((l) => l.sleep_hours != null)

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={Utensils} color="text-cyan-600">Питание / Сон</PageHeading>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Вес, кг">
          {weightSeries.length > 0 ? (
            <ChartWrapper labels={weightSeries.map((l) => l.date)} data={weightSeries.map((l) => l.weight_kg)} label="Вес" />
          ) : (
            <p className="text-sm text-neutral-500">Пока нет данных</p>
          )}
        </Card>
        <Card title="Сон, часов">
          {sleepSeries.length > 0 ? (
            <ChartWrapper labels={sleepSeries.map((l) => l.date)} data={sleepSeries.map((l) => l.sleep_hours)} label="Сон" />
          ) : (
            <p className="text-sm text-neutral-500">Пока нет данных</p>
          )}
        </Card>
      </div>

      <Card title="Дневной лог">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Дата
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Вес, кг
            <input
              type="number"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
              className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Приёмы пищи
            <input
              type="number"
              min="0"
              value={form.meals_count}
              onChange={(e) => setForm({ ...form, meals_count: e.target.value })}
              className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Вода, стаканов
            <input
              type="number"
              min="0"
              value={form.water_glasses}
              onChange={(e) => setForm({ ...form, water_glasses: e.target.value })}
              className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            Сон, часов
            <input
              type="number"
              step="0.5"
              min="0"
              value={form.sleep_hours}
              onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
              className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            По плану (1-5)
            <input
              type="number"
              min="1"
              max="5"
              value={form.plan_score}
              onChange={(e) => setForm({ ...form, plan_score: e.target.value })}
              className="w-24 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Сохранить
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-xs text-neutral-600">
          Выбери дату — если запись за этот день уже есть, поля заполнятся автоматически, и сохранение обновит её.
        </p>
      </Card>
    </div>
  )
}
