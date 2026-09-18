import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { sumByWeek } from '../lib/calculations'
import { today } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { showMainButton, hideMainButton, notifySuccess } from '../lib/telegram'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { PageHeading } from '../components/PageHeading'

const FOCUS_MIN = 25
const BREAK_MIN = 5

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Focus() {
  const { sessions, loading: sessionsLoading, logSession } = useFocusSessions()
  const { timer, loading: timerLoading, start, clear } = useFocusTimer()
  const [mode, setMode] = useState('focus')
  const [pausedSeconds, setPausedSeconds] = useState(FOCUS_MIN * 60)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState(null)
  const [banner, setBanner] = useState(null)
  const completingRef = useRef(false)
  const audioCtxRef = useRef(null)

  const running = Boolean(timer)
  const displayMode = timer ? timer.mode : mode

  // AudioContext можно запускать только по прямому действию пользователя
  // (иначе браузер его глушит) — "прогреваем" по первому тапу на странице,
  // чтобы звук сработал даже если таймер уже шёл до открытия страницы.
  function ensureAudioContext() {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      audioCtxRef.current = new Ctx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }

  useEffect(() => {
    function prime() {
      ensureAudioContext()
      document.removeEventListener('pointerdown', prime)
    }
    document.addEventListener('pointerdown', prime)
    return () => document.removeEventListener('pointerdown', prime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function playBeep() {
    try {
      const ctx = ensureAudioContext()
      if (!ctx) return
      const startAt = ctx.currentTime
      ;[0, 0.24].forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.0001, startAt + offset)
        gain.gain.exponentialRampToValueAtTime(0.3, startAt + offset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startAt + offset)
        osc.stop(startAt + offset + 0.24)
      })
    } catch {
      // ignore
    }
  }

  function requestNotificationPermission() {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch {
      // ignore
    }
  }

  function notifyCompletion(finishedMode) {
    playBeep()
    notifySuccess()
    const text =
      finishedMode === 'focus' ? 'Помодоро завершён! Время для перерыва ☕' : 'Перерыв закончен — снова за дело 🎯'
    setBanner(text)
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Life Planner', { body: text })
      }
    } catch {
      // ignore
    }
  }

  // Держим локальный режим синхронным с активным серверным таймером —
  // например, если помодоро был запущен на другом устройстве.
  useEffect(() => {
    if (timer) setMode(timer.mode)
  }, [timer])

  // Остаток всегда пересчитывается от ends_at (реального времени), а не
  // просто уменьшается на 1 каждую секунду — поэтому неважно, была ли
  // вкладка свёрнута, мини-апп закрыт или экран телефона выключен: при
  // следующей проверке значение всё равно окажется верным.
  useEffect(() => {
    if (!timer) {
      hideMainButton()
      document.title = 'Life Planner'
      return undefined
    }

    function remainingMs() {
      return new Date(timer.ends_at).getTime() - Date.now()
    }

    function updateDisplay(ms) {
      const seconds = Math.max(0, Math.ceil(ms / 1000))
      showMainButton(`${timer.mode === 'focus' ? '🎯' : '☕'} ${formatTime(seconds)}`)
      document.title = `${formatTime(seconds)} · ${timer.mode === 'focus' ? 'Фокус' : 'Перерыв'}`
      setNow(Date.now())
    }

    async function complete() {
      if (completingRef.current) return
      completingRef.current = true
      try {
        if (timer.mode === 'focus') await logSession(FOCUS_MIN)
        await clear()
        notifyCompletion(timer.mode)
        const nextMode = timer.mode === 'focus' ? 'break' : 'focus'
        setMode(nextMode)
        setPausedSeconds(nextMode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
        setError(null)
      } catch {
        setError(GENERIC_ERROR)
      } finally {
        completingRef.current = false
      }
    }

    const initialRemaining = remainingMs()
    if (initialRemaining <= 0) {
      complete()
    } else {
      updateDisplay(initialRemaining)
    }

    const id = setInterval(() => {
      const ms = remainingMs()
      if (ms <= 0) complete()
      else updateDisplay(ms)
    }, 1000)

    return () => {
      clearInterval(id)
      hideMainButton()
      document.title = 'Life Planner'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer])

  const displaySeconds = running ? Math.max(0, Math.ceil((new Date(timer.ends_at).getTime() - now) / 1000)) : pausedSeconds

  async function toggle() {
    try {
      if (running) {
        const remaining = Math.max(0, Math.ceil((new Date(timer.ends_at).getTime() - Date.now()) / 1000))
        setPausedSeconds(remaining)
        await clear()
      } else {
        ensureAudioContext()
        requestNotificationPermission()
        setBanner(null)
        const endsAt = new Date(Date.now() + pausedSeconds * 1000).toISOString()
        await start(mode, endsAt)
      }
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function reset() {
    try {
      await clear()
      setPausedSeconds(mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
      setBanner(null)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function switchMode() {
    const nextMode = mode === 'focus' ? 'break' : 'focus'
    try {
      await clear()
      setMode(nextMode)
      setPausedSeconds(nextMode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
      setBanner(null)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (sessionsLoading || timerLoading) return <p className="text-neutral-500">Загрузка…</p>

  const todayCount = sessions.filter((s) => s.date === today()).length
  const weekly = sumByWeek(sessions.map((s) => ({ date: s.date, value: 1 })))

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={Timer} color="text-violet-600">Фокус</PageHeading>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {banner && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {banner}
          <button
            onClick={() => setBanner(null)}
            aria-label="Скрыть уведомление"
            className="shrink-0 text-emerald-600 hover:text-emerald-800"
          >
            ✕
          </button>
        </div>
      )}

      <Card>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm font-medium text-neutral-500">{displayMode === 'focus' ? 'Фокус' : 'Перерыв'}</p>
          <p className="text-6xl font-semibold tabular-nums">{formatTime(displaySeconds)}</p>
          <div className="flex gap-2">
            <button
              onClick={toggle}
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
              {displayMode === 'focus' ? 'На перерыв' : 'На фокус'}
            </button>
          </div>
          <p className="text-xs text-neutral-500">Сегодня завершено помодоро: {todayCount}</p>
          <p className="max-w-xs text-center text-xs text-neutral-400">
            Таймер хранится на сервере: если закрыть приложение или выключить экран, при следующем открытии он
            покажет верный остаток, а не начнётся заново.
          </p>
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
