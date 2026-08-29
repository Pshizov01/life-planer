import { useHabits } from '../hooks/useHabits'
import { goalProgress } from '../lib/calculations'
import { PRAYER_NAMES } from '../lib/constants'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

function PrayerToday({ prayers, today, isDone, toggleLog }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prayers.map((prayer) => {
        const done = isDone(prayer.id, today)
        return (
          <button
            key={prayer.id}
            onClick={() => toggleLog(prayer.id, today)}
            className={`flex min-w-[92px] flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-sm transition-colors ${
              done
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <span className="font-medium">{prayer.name}</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                done ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {done ? '✓' : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Prayers() {
  const { habits, logs, dates, loading, toggleLog } = useHabits()

  function isDone(habitId, date) {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const prayers = habits.filter((h) => PRAYER_NAMES.includes(h.name))
  const today = new Date().toLocaleDateString('en-CA')

  const prayerCompletion = dates.map((date) => {
    const doneCount = prayers.filter((p) => isDone(p.id, date)).length
    return goalProgress(doneCount, prayers.length)
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Намаз</h1>

      {prayers.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">
            Намазы ещё не добавлены в базу — выполни seed-insert из docs/SPEC.md в Supabase.
          </p>
        </Card>
      ) : (
        <>
          <Card title="Сегодня">
            <PrayerToday prayers={prayers} today={today} isDone={isDone} toggleLog={toggleLog} />
          </Card>

          <Card title="За неделю, % выполнено">
            <ChartWrapper labels={dates.map(dayLabel)} data={prayerCompletion} label="% выполнено" />
          </Card>
        </>
      )}
    </div>
  )
}
