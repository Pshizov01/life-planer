import { useEffect, useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { usePrayerSettings } from '../hooks/usePrayerSettings'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { goalProgress } from '../lib/calculations'
import { PRAYER_NAMES, GENERIC_ERROR } from '../lib/constants'
import { dayLabel, today } from '../lib/dates'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'

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
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <span className="font-medium">{prayer.name}</span>
            {times?.[prayer.name] && <span className="text-xs text-neutral-500">{times[prayer.name]}</span>}
            <span
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
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

function LocationSettings({ settings, onSave }) {
  const [city, setCity] = useState(settings?.city ?? '')
  const [country, setCountry] = useState(settings?.country ?? '')
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    setCity(settings?.city ?? '')
    setCountry(settings?.country ?? '')
  }, [settings])

  const usingCoords = settings?.latitude != null && settings?.longitude != null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!city.trim() || !country.trim()) return
    try {
      await onSave({ city: city.trim(), country: country.trim() })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается этим браузером')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await onSave({ latitude: position.coords.latitude, longitude: position.coords.longitude })
          setError(null)
        } catch {
          setError(GENERIC_ERROR)
        } finally {
          setLocating(false)
        }
      },
      () => {
        setError('Не удалось определить местоположение — проверь разрешение на геолокацию')
        setLocating(false)
      },
    )
  }

  return (
    <Card title="Местоположение для расчёта времени намаза">
      {usingCoords && (
        <p className="mb-2 text-xs text-neutral-500">Сейчас используется геолокация (самый надёжный вариант).</p>
      )}

      <button
        onClick={handleUseLocation}
        disabled={locating}
        className="mb-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {locating ? 'Определяем…' : 'Определить моё местоположение'}
      </button>

      <p className="mb-2 text-xs text-neutral-500">Или укажи город вручную:</p>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Город"
          className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Страна"
          className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
        >
          Сохранить
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}

export default function Prayers() {
  const { habits, logs, dates, loading, toggleLog } = useHabits()
  const { settings, loading: settingsLoading, saveLocation } = usePrayerSettings()
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

  const prayerCompletion = dates.map((date) => {
    const doneCount = prayers.filter((p) => isDone(p.id, date)).length
    return goalProgress(doneCount, prayers.length)
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Намаз</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <LocationSettings settings={settings} onSave={saveLocation} />
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
