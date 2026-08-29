import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { habitStreak, goalProgress } from '../lib/calculations'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'

const PRAYER_NAMES = ['Фаджр', 'Зухр', 'Аср', 'Магриб', 'Иша']

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

function HabitTable({ habits, dates, isDone, streakFor, toggleLog }) {
  if (habits.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="text-left font-medium text-neutral-500">Привычка</th>
            {dates.map((date) => (
              <th key={date} className="w-9 text-center font-normal text-neutral-400">
                {dayLabel(date)}
              </th>
            ))}
            <th className="text-left font-medium text-neutral-500">Стрик</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id}>
              <td className="whitespace-nowrap pr-2">{habit.name}</td>
              {dates.map((date) => {
                const done = isDone(habit.id, date)
                return (
                  <td key={date}>
                    <button
                      onClick={() => toggleLog(habit.id, date)}
                      aria-label={`${habit.name} ${date}`}
                      className={`h-7 w-7 rounded-md ${
                        done ? 'bg-emerald-500' : 'bg-neutral-100 hover:bg-neutral-200'
                      }`}
                    />
                  </td>
                )
              })}
              <td className="pl-2 text-neutral-500">{streakFor(habit.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Habits() {
  const { habits, logs, dates, loading, toggleLog, addHabit } = useHabits()
  const [newHabitName, setNewHabitName] = useState('')

  function isDone(habitId, date) {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  function streakFor(habitId) {
    const entries = dates.map((date) => ({ date, done: isDone(habitId, date) }))
    return habitStreak(entries)
  }

  async function handleAddHabit(e) {
    e.preventDefault()
    if (!newHabitName.trim()) return
    await addHabit(newHabitName.trim())
    setNewHabitName('')
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const orderedDates = [...dates].reverse()
  const prayers = habits.filter((h) => PRAYER_NAMES.includes(h.name))
  const otherHabits = habits.filter((h) => !PRAYER_NAMES.includes(h.name))
  const today = dates[0]

  const prayerCompletion = orderedDates.map((date) => {
    const doneCount = prayers.filter((p) => isDone(p.id, date)).length
    return goalProgress(doneCount, prayers.length)
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Привычки</h1>

      {prayers.length > 0 && (
        <Card title="Намазы сегодня">
          <PrayerToday prayers={prayers} today={today} isDone={isDone} toggleLog={toggleLog} />
        </Card>
      )}

      {prayers.length > 0 && (
        <Card title="Намазы, % за день">
          <ChartWrapper labels={orderedDates.map(dayLabel)} data={prayerCompletion} label="% выполнено" />
        </Card>
      )}

      <Card title="Привычки">
        <HabitTable habits={otherHabits} dates={orderedDates} isDone={isDone} streakFor={streakFor} toggleLog={toggleLog} />
        {otherHabits.length === 0 && <p className="py-2 text-center text-sm text-neutral-500">Пока нет других привычек</p>}
      </Card>

      <Card title="Добавить привычку">
        <form onSubmit={handleAddHabit} className="flex gap-2">
          <input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Название привычки"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить
          </button>
        </form>
      </Card>
    </div>
  )
}
