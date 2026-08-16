import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { habitStreak } from '../lib/calculations'
import { Card } from '../components/Card'

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
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

  if (loading) return <p className="text-neutral-400">Загрузка…</p>

  const orderedDates = [...dates].reverse()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Привычки</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium text-neutral-400">Привычка</th>
                {orderedDates.map((date) => (
                  <th key={date} className="w-9 text-center font-normal text-neutral-500">
                    {dayLabel(date)}
                  </th>
                ))}
                <th className="text-left font-medium text-neutral-400">Стрик</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="whitespace-nowrap pr-2">{habit.name}</td>
                  {orderedDates.map((date) => {
                    const done = isDone(habit.id, date)
                    return (
                      <td key={date}>
                        <button
                          onClick={() => toggleLog(habit.id, date)}
                          aria-label={`${habit.name} ${date}`}
                          className={`h-7 w-7 rounded-md ${
                            done ? 'bg-emerald-500' : 'bg-neutral-800 hover:bg-neutral-700'
                          }`}
                        />
                      </td>
                    )
                  })}
                  <td className="pl-2 text-neutral-400">{streakFor(habit.id)}</td>
                </tr>
              ))}
              {habits.length === 0 && (
                <tr>
                  <td colSpan={orderedDates.length + 2} className="py-4 text-center text-neutral-500">
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
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
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
