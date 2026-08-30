import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { habitStreak } from '../lib/calculations'
import { PRAYER_NAMES, GENERIC_ERROR } from '../lib/constants'
import { dayLabel } from '../lib/dates'
import { Card } from '../components/Card'

export default function Habits() {
  const { habits, logs, dates, loading, toggleLog, addHabit, deleteHabit } = useHabits()
  const [newHabitName, setNewHabitName] = useState('')
  const [error, setError] = useState(null)

  function isDone(habitId, date) {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  function streakFor(habitId) {
    const entries = [...dates].reverse().map((date) => ({ date, done: isDone(habitId, date) }))
    return habitStreak(entries)
  }

  async function handleToggle(habitId, date) {
    try {
      await toggleLog(habitId, date)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleAddHabit(e) {
    e.preventDefault()
    if (!newHabitName.trim()) return
    try {
      await addHabit(newHabitName.trim())
      setNewHabitName('')
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleDelete(habit) {
    if (!window.confirm(`Удалить привычку «${habit.name}»? История отметок тоже удалится.`)) return
    try {
      await deleteHabit(habit.id)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const personalHabits = habits.filter((h) => !PRAYER_NAMES.includes(h.name))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Привычки</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {personalHabits.map((habit) => (
                <tr key={habit.id}>
                  <td className="whitespace-nowrap pr-2">{habit.name}</td>
                  {dates.map((date) => {
                    const done = isDone(habit.id, date)
                    return (
                      <td key={date}>
                        <button
                          onClick={() => handleToggle(habit.id, date)}
                          aria-label={`${habit.name} ${date}`}
                          className={`h-7 w-7 rounded-md ${
                            done ? 'bg-emerald-500' : 'bg-neutral-100 hover:bg-neutral-200'
                          }`}
                        />
                      </td>
                    )
                  })}
                  <td className="pl-2 text-neutral-500">{streakFor(habit.id)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(habit)}
                      aria-label={`Удалить ${habit.name}`}
                      className="px-2 text-xs text-neutral-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {personalHabits.length === 0 && (
                <tr>
                  <td colSpan={dates.length + 3} className="py-4 text-center text-neutral-500">
                    Пока нет привычек
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
