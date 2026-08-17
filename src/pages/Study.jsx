import { useState } from 'react'
import { useStudy } from '../hooks/useStudy'
import { sumByWeek } from '../lib/calculations'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { ProgressBar } from '../components/ProgressBar'

function today() {
  return new Date().toLocaleDateString('en-CA')
}

const emptyGoal = { title: '', target: '', unit: '' }
const emptySession = { date: today(), subject: '', duration_min: '' }

export default function Study() {
  const { goals, sessions, loading, addGoal, updateGoalProgress, addSession } = useStudy()
  const [goalForm, setGoalForm] = useState(emptyGoal)
  const [sessionForm, setSessionForm] = useState(emptySession)
  const [progressDrafts, setProgressDrafts] = useState({})

  async function handleAddGoal(e) {
    e.preventDefault()
    if (!goalForm.title.trim() || !Number(goalForm.target)) return
    await addGoal({ title: goalForm.title.trim(), target: Number(goalForm.target), unit: goalForm.unit.trim() })
    setGoalForm(emptyGoal)
  }

  async function handleUpdateProgress(goalId) {
    const value = Number(progressDrafts[goalId])
    if (Number.isNaN(value)) return
    await updateGoalProgress(goalId, value)
    setProgressDrafts({ ...progressDrafts, [goalId]: '' })
  }

  async function handleAddSession(e) {
    e.preventDefault()
    const duration = Number(sessionForm.duration_min)
    if (!sessionForm.subject.trim() || !duration || duration <= 0) return
    await addSession({ ...sessionForm, subject: sessionForm.subject.trim(), duration_min: duration })
    setSessionForm({ ...emptySession, date: sessionForm.date })
  }

  if (loading) return <p className="text-neutral-400">Загрузка…</p>

  const weekly = sumByWeek(sessions.map((s) => ({ date: s.date, value: s.duration_min })))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Учёба</h1>

      <Card title="Цели">
        <div className="flex flex-col gap-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <p className="mb-1 text-sm">
                {goal.title} {goal.unit && <span className="text-neutral-500">({goal.unit})</span>}
              </p>
              <ProgressBar value={goal.progress} max={goal.target} />
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  placeholder="Новый прогресс"
                  value={progressDrafts[goal.id] ?? ''}
                  onChange={(e) => setProgressDrafts({ ...progressDrafts, [goal.id]: e.target.value })}
                  className="w-32 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  onClick={() => handleUpdateProgress(goal.id)}
                  className="rounded-lg bg-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  Обновить
                </button>
              </div>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-neutral-500">Пока нет целей</p>}
        </div>

        <form onSubmit={handleAddGoal} className="mt-4 flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
          <input
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            placeholder="Название цели"
            className="flex-1 min-w-[160px] rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            value={goalForm.target}
            onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
            placeholder="Цель (число)"
            className="w-32 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={goalForm.unit}
            onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
            placeholder="Ед. измерения"
            className="w-32 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить цель
          </button>
        </form>
      </Card>

      <Card title="Время занятий по неделям, мин">
        {weekly.length > 0 ? (
          <ChartWrapper type="bar" labels={weekly.map((w) => w.week)} data={weekly.map((w) => w.total)} label="Минуты" />
        ) : (
          <p className="text-sm text-neutral-500">Пока нет данных</p>
        )}
      </Card>

      <Card title="Добавить сессию занятий">
        <form onSubmit={handleAddSession} className="flex flex-wrap gap-2">
          <input
            type="date"
            value={sessionForm.date}
            onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={sessionForm.subject}
            onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
            placeholder="Предмет"
            className="flex-1 min-w-[160px] rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            min="1"
            value={sessionForm.duration_min}
            onChange={(e) => setSessionForm({ ...sessionForm, duration_min: e.target.value })}
            placeholder="Мин"
            className="w-24 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить
          </button>
        </form>
      </Card>

      <Card title="История сессий">
        <div className="flex flex-col divide-y divide-neutral-800">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-neutral-500">{s.date}</span>
              <span className="flex-1 px-3">{s.subject}</span>
              <span className="text-neutral-400">{s.duration_min} мин</span>
            </div>
          ))}
          {sessions.length === 0 && <p className="py-4 text-center text-neutral-500">Пока нет сессий</p>}
        </div>
      </Card>
    </div>
  )
}
