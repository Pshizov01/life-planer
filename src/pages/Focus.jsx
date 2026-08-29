import { useEffect, useRef, useState } from 'react'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { sumByWeek } from '../lib/calculations'
import { today } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'

const FOCUS_MIN = 25
const BREAK_MIN = 5

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Focus() {
  const { sessions, loading, logSession } = useFocusSessions()
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          if (mode === 'focus') {
            logSession(FOCUS_MIN)
              .then(() => setError(null))
              .catch(() => setError(GENERIC_ERROR))
            setMode('break')
            return BREAK_MIN * 60
          }
          setMode('focus')
          return FOCUS_MIN * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode])

  function reset() {
    setRunning(false)
    setSecondsLeft(mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
  }

  function switchMode() {
    setRunning(false)
    const nextMode = mode === 'focus' ? 'break' : 'focus'
    setMode(nextMode)
    setSecondsLeft(nextMode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const todayCount = sessions.filter((s) => s.date === today()).length
  const weekly = sumByWeek(sessions.map((s) => ({ date: s.date, value: 1 })))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Фокус</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm font-medium text-neutral-500">{mode === 'focus' ? 'Фокус' : 'Перерыв'}</p>
          <p className="text-6xl font-semibold tabular-nums">{formatTime(secondsLeft)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              {running ? 'Пауза' : 'Старт'}
            </button>
            <button
              onClick={reset}
              className="rounded-lg bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Сброс
            </button>
            <button
              onClick={switchMode}
              className="rounded-lg bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              {mode === 'focus' ? 'На перерыв' : 'На фокус'}
            </button>
          </div>
          <p className="text-xs text-neutral-500">Сегодня завершено помодоро: {todayCount}</p>
        </div>
      </Card>

      <Card title="Помодоро по неделям">
        {weekly.length > 0 ? (
          <ChartWrapper type="bar" labels={weekly.map((w) => w.week)} data={weekly.map((w) => w.total)} label="Помодоро" />
        ) : (
          <p className="text-sm text-neutral-500">Пока нет завершённых сессий</p>
        )}
      </Card>
    </div>
  )
}
