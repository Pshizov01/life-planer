import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swords, Trophy, ChevronLeft, ChevronRight, Zap, Trash2 } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useDailyLog } from '../hooks/useDailyLog'
import { useXp } from '../hooks/useXp'
import { mondayOf, goalProgress } from '../lib/calculations'
import { XP, levelFromXp, dayXp, weekSummary, habitsActiveOn, dayRank } from '../lib/quests'
import { today, addDays } from '../lib/dates'
import { PRAYER_NAMES, GENERIC_ERROR } from '../lib/constants'
import { notifySuccess } from '../lib/telegram'
import { Card } from '../components/Card'
import { PageHeading } from '../components/PageHeading'
import { ProgressRing } from '../components/ProgressRing'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MOODS = ['😞', '😕', '😐', '🙂', '😄']
const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10]

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`)
}

function longDayLabel(dateStr) {
  const label = toDate(dateStr).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function shortDayLabel(dateStr) {
  return toDate(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function weekdayOf(dateStr) {
  return WEEKDAYS[(toDate(dateStr).getDay() + 6) % 7]
}

function QuestItem({ title, done, disabled, xp, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-2 py-1.5">
      <button
        onClick={onToggle}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
            done ? 'border-fuchsia-600 bg-fuchsia-600 text-white' : 'border-neutral-300 text-transparent'
          }`}
        >
          ✓
        </span>
        <span className={`truncate ${done ? 'text-neutral-400 line-through' : ''}`}>{title}</span>
      </button>
      <span className={`shrink-0 text-xs font-medium ${done ? 'text-fuchsia-600' : 'text-neutral-300'}`}>+{xp} XP</span>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Удалить квест"
          className="shrink-0 rounded-md p-1 text-neutral-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  )
}

function QuestGroup({ title, children }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">{title}</p>
      <ul>{children}</ul>
    </div>
  )
}

function Tile({ label, value, color = 'text-neutral-900' }) {
  return (
    <div className="rounded-xl bg-neutral-50 px-3 py-2">
      <p className="text-[11px] text-neutral-500">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export default function Day() {
  const todayStr = today()
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayStr))
  const [selected, setSelected] = useState(todayStr)
  const { habits, logs, dates, loading: habitsLoading, toggleLog } = useHabits(weekStart)
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useDailyTasks()
  const { logs: dailyLogs, loading: dailyLoading, saveDay } = useDailyLog()
  const { xp, loading: xpLoading, reload: reloadXp } = useXp()
  const [questTitle, setQuestTitle] = useState('')
  const [lessonDraft, setLessonDraft] = useState('')
  const [levelUp, setLevelUp] = useState(null)
  const [error, setError] = useState(null)
  const prevLevelRef = useRef(null)

  const { level, current, needed } = levelFromXp(xp)
  const review = dailyLogs.find((l) => l.date === selected)

  useEffect(() => {
    setLessonDraft(review?.lesson ?? '')
  }, [selected, review?.lesson])

  useEffect(() => {
    if (xpLoading) return
    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      setLevelUp(level)
      notifySuccess()
    }
    prevLevelRef.current = level
  }, [level, xpLoading])

  async function run(action) {
    try {
      await action()
      await reloadXp()
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  function changeWeek(delta) {
    const nextStart = addDays(weekStart, delta * 7)
    setWeekStart(nextStart)
    setSelected(mondayOf(todayStr) === nextStart ? todayStr : nextStart)
  }

  function handleAddQuest(e) {
    e.preventDefault()
    const title = questTitle.trim()
    if (!title) return
    run(async () => {
      await addTask(selected, title)
      setQuestTitle('')
    })
  }

  function saveReview(fields) {
    run(() => saveDay({ date: selected, ...fields }))
  }

  function saveLesson() {
    const lesson = lessonDraft.trim()
    if (lesson === (review?.lesson ?? '')) return
    saveReview({ lesson: lesson || null })
  }

  if (habitsLoading || tasksLoading || dailyLoading || xpLoading) {
    return <p className="text-neutral-500">Загрузка…</p>
  }

  function statsFor(date) {
    const active = habitsActiveOn(habits, date)
    const activeIds = new Set(active.map((h) => h.id))
    const doneIds = new Set(logs.filter((l) => l.date === date && activeIds.has(l.habit_id)).map((l) => l.habit_id))
    const dayTasks = tasks.filter((t) => t.date === date)
    const tasksDone = dayTasks.filter((t) => t.done).length
    const total = active.length + dayTasks.length
    const done = doneIds.size + tasksDone
    return { date, active, doneIds, dayTasks, habitsDone: doneIds.size, tasksDone, done, total, pct: goalProgress(done, total) }
  }

  const days = dates.map(statsFor)
  const summary = weekSummary(days.filter((d) => d.date <= todayStr))
  const day = statsFor(selected)
  const isFuture = selected > todayStr
  const prayers = day.active.filter((h) => PRAYER_NAMES.includes(h.name))
  const dailyQuests = day.active.filter((h) => !PRAYER_NAMES.includes(h.name))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeading icon={Swords} color="text-fuchsia-600">День</PageHeading>
        <p className="mt-1 text-sm text-neutral-500">Каждый день — игра. Закрывай квесты и прокачивай уровень.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {levelUp && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm font-medium text-fuchsia-800">
          🎉 Новый уровень — {levelUp}! Так держать.
          <button onClick={() => setLevelUp(null)} aria-label="Скрыть" className="shrink-0 text-fuchsia-600">
            ✕
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-linear-to-br from-fuchsia-600 to-violet-600 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">Уровень</p>
            <p className="text-4xl font-semibold">{level}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Trophy className="h-6 w-6" />
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${goalProgress(current, needed)}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/80">
          {current} / {needed} XP до уровня {level + 1} · всего {xp} XP
        </p>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => changeWeek(-1)}
            aria-label="Предыдущая неделя"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium">
            {shortDayLabel(dates[0])} – {shortDayLabel(dates[6])}
          </p>
          <button
            onClick={() => changeWeek(1)}
            aria-label="Следующая неделя"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <button
              key={d.date}
              onClick={() => setSelected(d.date)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 ${
                selected === d.date ? 'bg-fuchsia-50 ring-1 ring-fuchsia-200' : 'hover:bg-neutral-50'
              }`}
            >
              <span className={`text-[11px] ${d.date === todayStr ? 'font-semibold text-fuchsia-600' : 'text-neutral-500'}`}>
                {WEEKDAYS[i]}
              </span>
              <ProgressRing pct={d.date > todayStr ? 0 : d.pct} size={36}>
                {toDate(d.date).getDate()}
              </ProgressRing>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Tile label="Всего квестов" value={summary.total} />
          <Tile label="Выполнено" value={summary.done} color="text-emerald-600" />
          <Tile label="Не выполнено" value={summary.missed} color="text-red-600" />
          <Tile label="Средний %" value={`${summary.avgPct}%`} />
          <Tile label="Лучший день" value={summary.best ? weekdayOf(summary.best) : '—'} color="text-emerald-600" />
          <Tile label="Худший день" value={summary.worst ? weekdayOf(summary.worst) : '—'} color="text-red-600" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{longDayLabel(selected)}</h2>
            <p className="text-sm text-fuchsia-600">{isFuture ? 'День ещё впереди' : dayRank(day.pct)}</p>
            <p className="mt-1 text-xs text-neutral-500">
              Выполнено {day.done} · Осталось {day.total - day.done} · +{dayXp(day.habitsDone, day.tasksDone)} XP
            </p>
          </div>
          <ProgressRing pct={day.pct} size={60} thickness={6}>
            {day.pct}%
          </ProgressRing>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {isFuture && (
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
              Ежедневные квесты откроются в свой день, а разовые можно запланировать уже сейчас.
            </p>
          )}

          {prayers.length > 0 && (
            <QuestGroup title="Намаз">
              {prayers.map((h) => (
                <QuestItem
                  key={h.id}
                  title={h.name}
                  done={day.doneIds.has(h.id)}
                  disabled={isFuture}
                  xp={XP.habit}
                  onToggle={() => run(() => toggleLog(h.id, selected))}
                />
              ))}
            </QuestGroup>
          )}

          <QuestGroup title="Ежедневные квесты">
            {dailyQuests.map((h) => (
              <QuestItem
                key={h.id}
                title={h.name}
                done={day.doneIds.has(h.id)}
                disabled={isFuture}
                xp={XP.habit}
                onToggle={() => run(() => toggleLog(h.id, selected))}
              />
            ))}
            {dailyQuests.length === 0 && (
              <li className="py-1 text-sm text-neutral-500">
                Пока пусто — добавь повторяющиеся дела в разделе{' '}
                <Link to="/habits" className="text-fuchsia-600 hover:underline">
                  «Привычки»
                </Link>
              </li>
            )}
          </QuestGroup>

          <QuestGroup title="Разовые квесты">
            {day.dayTasks.map((t) => (
              <QuestItem
                key={t.id}
                title={t.title}
                done={t.done}
                xp={XP.task}
                onToggle={() => run(() => toggleTask(t.id, t.done))}
                onDelete={() => run(() => deleteTask(t.id))}
              />
            ))}
            {day.dayTasks.length === 0 && <li className="py-1 text-sm text-neutral-500">На этот день разовых квестов нет</li>}
          </QuestGroup>

          <form onSubmit={handleAddQuest} className="flex gap-2">
            <input
              value={questTitle}
              onChange={(e) => setQuestTitle(e.target.value)}
              placeholder="Новый квест на этот день"
              className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-fuchsia-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500"
            >
              Добавить
            </button>
          </form>
        </div>
      </Card>

      <Card title="Итог дня">
        {isFuture ? (
          <p className="text-sm text-neutral-500">Итог можно подвести, когда день наступит.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-xs text-neutral-500">Урок дня</p>
              <input
                value={lessonDraft}
                onChange={(e) => setLessonDraft(e.target.value)}
                onBlur={saveLesson}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                placeholder="Что вынес из этого дня?"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-fuchsia-600"
              />
            </div>

            <div>
              <p className="mb-1 text-xs text-neutral-500">Сон, часов</p>
              <div className="flex flex-wrap gap-1.5">
                {SLEEP_OPTIONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => saveReview({ sleep_hours: h })}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      Number(review?.sleep_hours) === h
                        ? 'bg-cyan-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-neutral-500">Энергия</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => saveReview({ energy: n })}
                    aria-label={`Энергия ${n} из 5`}
                    className="rounded-lg p-1 hover:bg-amber-50"
                  >
                    <Zap
                      className={`h-6 w-6 ${
                        (review?.energy ?? 0) >= n ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-neutral-500">Настроение</p>
              <div className="flex gap-1">
                {MOODS.map((emoji, i) => (
                  <button
                    key={emoji}
                    onClick={() => saveReview({ mood: i + 1 })}
                    aria-label={`Настроение ${i + 1} из 5`}
                    className={`rounded-lg px-2 py-1 text-2xl ${
                      review?.mood === i + 1 ? 'bg-fuchsia-50 ring-1 ring-fuchsia-200' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
