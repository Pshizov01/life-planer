import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { usePrayerSettings } from '../hooks/usePrayerSettings'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { goalProgress } from '../lib/calculations'
import { PRAYER_NAMES, GENERIC_ERROR } from '../lib/constants'
import { dayLabel, today } from '../lib/dates'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { PageHeading } from '../components/PageHeading'

function PrayerToday({ prayers, today, isDone, onToggle, times }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prayers.map((prayer) => {
        const done = isDone(prayer.id, today)
        return (
          <button
            key={prayer.id}
            onClick={() => onToggle(prayer.id, today)}
            className={`flex min-w-[92px] flex-1 flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm transition-colors ${
              done
                ? 'border-amber-700 bg-amber-50 text-amber-800'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <span className="font-medium">{prayer.name}</span>
            {times?.[prayer.name] && <span className="text-xs text-neutral-500">{times[prayer.name]}</span>}
            <span
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                done ? 'bg-amber-700 text-white' : 'bg-neutral-100 text-neutral-400'
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
  const { settings, loading: settingsLoading } = usePrayerSettings()
  const { times, error: timesError } = usePrayerTimes(settings)
  const [error, setError] = useState(null)

  function isDone(habitId, date) {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  async function handleToggle(habitId, date) {
    try {
      await toggleLog(habitId, date)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading || settingsLoading) return <p className="text-neutral-500">Загрузка…</p>

  const prayers = habits.filter((h) => PRAYER_NAMES.includes(h.name))
  const todayStr = today()
  const hasLocation = Boolean(settings?.city || (settings?.latitude != null && settings?.longitude != null))

  const prayerCompletion = dates.map((date) => {
    const doneCount = prayers.filter((p) => isDone(p.id, date)).length
    return goalProgress(doneCount, prayers.length)
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={Landmark} color="text-amber-700">Намаз</PageHeading>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!hasLocation && (
        <Card>
          <p className="text-sm text-neutral-600">
            Чтобы видеть точное время намаза, укажи местоположение —{' '}
            <Link to="/settings" className="text-amber-700 underline">
              открыть настройки
            </Link>
            .
          </p>
        </Card>
      )}
      {timesError && <p className="text-sm text-amber-600">{timesError}</p>}

      {prayers.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">
            Намазы ещё не добавлены в базу — выполни seed-insert из docs/SPEC.md в Supabase.
          </p>
        </Card>
      ) : (
        <>
          <Card title="Сегодня">
            <PrayerToday prayers={prayers} today={todayStr} isDone={isDone} onToggle={handleToggle} times={times} />
          </Card>

          <Card title="За неделю, % выполнено">
            <ChartWrapper labels={dates.map(dayLabel)} data={prayerCompletion} label="% выполнено" />
          </Card>
        </>
      )}
    </div>
  )
}
