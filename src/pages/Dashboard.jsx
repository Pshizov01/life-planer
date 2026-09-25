import { useEffect, useRef, useState } from 'react'
import { LayoutGrid, Dumbbell, Wallet, Timer, FolderKanban } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useDailyLog } from '../hooks/useDailyLog'
import { useXp } from '../hooks/useXp'
import { useWorkouts } from '../hooks/useWorkouts'
import { useFinance } from '../hooks/useFinance'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { useProjects } from '../hooks/useProjects'
import { mondayOf, goalProgress, sumByCategory } from '../lib/calculations'
import { levelFromXp, weekSummary, habitsActiveOn } from '../lib/quests'
import { today, addDays } from '../lib/dates'
import { PRAYER_NAMES, GENERIC_ERROR } from '../lib/constants'
import { notifySuccess } from '../lib/telegram'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { StatCard } from '../components/StatCard'
import { PageHeading } from '../components/PageHeading'
import { WeekProgress } from '../components/WeekProgress'
import { DayColumn } from '../components/DayColumn'

function todayLabel() {
  const label = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// Намазы идут первыми в списке квестов дня, затем остальные привычки.
function questOrder(habits) {
  const prayers = habits.filter((h) => PRAYER_NAMES.includes(h.name))
  const others = habits.filter((h) => !PRAYER_NAMES.includes(h.name))
  return [...prayers, ...others]
}

export default function Dashboard() {
  const todayStr = today()
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayStr))
  const { habits, logs, dates, loading: habitsLoading, toggleLog } = useHabits(weekStart)
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useDailyTasks()
  const { logs: dailyLogs, loading: dailyLoading, saveDay } = useDailyLog()
  const { xp, loading: xpLoading, reload: reloadXp } = useXp()
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const { transactions, loading: financeLoading } = useFinance()
  const { sessions: focusSessions, loading: focusLoading } = useFocusSessions()
  const { projects, tasks: projectTasks, loading: projectsLoading } = useProjects()
  const [levelUp, setLevelUp] = useState(null)
  const [error, setError] = useState(null)
  const prevLevelRef = useRef(null)
  const boardRef = useRef(null)
  const todayColRef = useRef(null)

  const { level, current, needed } = levelFromXp(xp)

  const loading =
    habitsLoading ||
    tasksLoading ||
    dailyLoading ||
    xpLoading ||
    workoutsLoading ||
    financeLoading ||
    focusLoading ||
    projectsLoading

  useEffect(() => {
    if (xpLoading) return
    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      setLevelUp(level)
      notifySuccess()
    }
    prevLevelRef.current = level
  }, [level, xpLoading])

  // Прокручиваем доску к сегодняшнему дню, как только она отрисовалась.
  useEffect(() => {
    if (loading || !boardRef.current) return
    boardRef.current.scrollLeft = todayColRef.current ? todayColRef.current.offsetLeft - 16 : 0
  }, [loading, weekStart])

  async function run(action) {
    try {
      await action()
      await reloadXp()
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  function statsFor(date) {
    const active = questOrder(habitsActiveOn(habits, date))
    const activeIds = new Set(active.map((h) => h.id))
    const doneIds = new Set(logs.filter((l) => l.date === date && activeIds.has(l.habit_id)).map((l) => l.habit_id))
    const dayTasks = tasks.filter((t) => t.date === date)
    const total = active.length + dayTasks.length
    const done = doneIds.size + dayTasks.filter((t) => t.done).length
    return { date, active, doneIds, dayTasks, done, total, pct: goalProgress(done, total) }
  }

  const days = dates.map(statsFor)
  const summary = weekSummary(days.filter((d) => d.date <= todayStr))

  const last7 = addDays(todayStr, -6)
  const weekWorkouts = workouts.filter((w) => w.date >= last7)
  const weekWorkoutsMinutes = weekWorkouts.reduce((sum, w) => sum + w.duration_min, 0)
  const weekFocus = focusSessions.filter((s) => s.date >= last7)
  const weekFocusMinutes = weekFocus.reduce((sum, s) => sum + s.duration_min, 0)

  const thisMonth = todayStr.slice(0, 7)
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth))
  const monthBalance = monthTx.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
  const byCategory = sumByCategory(
    monthTx.filter((t) => t.type === 'expense').map((t) => ({ category: t.category, amount: t.amount })),
  )

  const projectTasksDone = projectTasks.filter((t) => t.done).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeading icon={LayoutGrid} color="text-neutral-700">Главная</PageHeading>
        <p className="mt-1 text-sm text-neutral-500">{todayLabel()} · каждый день — игра, закрывай квесты</p>
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

      <WeekProgress
        days={days}
        summary={summary}
        todayStr={todayStr}
        level={level}
        levelCurrent={current}
        levelNeeded={needed}
        xp={xp}
        onPrevWeek={() => setWeekStart(addDays(weekStart, -7))}
        onNextWeek={() => setWeekStart(addDays(weekStart, 7))}
      />

      <div ref={boardRef} className="relative -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {days.map((d) => (
          <div key={d.date} ref={d.date === todayStr ? todayColRef : undefined} className="snap-start">
            <DayColumn
              day={d}
              review={dailyLogs.find((l) => l.date === d.date)}
              isToday={d.date === todayStr}
              isFuture={d.date > todayStr}
              onToggleHabit={(habitId) => run(() => toggleLog(habitId, d.date))}
              onToggleTask={(t) => run(() => toggleTask(t.id, t.done))}
              onDeleteTask={(id) => run(() => deleteTask(id))}
              onAddTask={(title) => run(() => addTask(d.date, title))}
              onSave={(fields) => run(() => saveDay({ date: d.date, ...fields }))}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Баланс за месяц"
          value={monthBalance.toLocaleString('ru-RU')}
          sub="доходы минус расходы"
          subColor={monthBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <StatCard
          icon={Dumbbell}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Спорт за 7 дней"
          value={weekWorkouts.length}
          sub={`${weekWorkoutsMinutes} мин активности`}
        />
        <StatCard
          icon={Timer}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          label="Фокус за 7 дней"
          value={weekFocus.length}
          sub={`${weekFocusMinutes} мин`}
        />
        <StatCard
          icon={FolderKanban}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Проекты"
          value={projectTasks.length > 0 ? `${projectTasksDone}/${projectTasks.length}` : '—'}
          sub={`${projects.length} в работе, задач выполнено`}
        />
      </div>

      <Card title="Расходы за месяц по категориям">
        {byCategory.length > 0 ? (
          <ChartWrapper
            type="bar"
            labels={byCategory.map((c) => c.category)}
            data={byCategory.map((c) => c.total)}
            label="Сумма"
          />
        ) : (
          <p className="text-sm text-neutral-500">Пока нет расходов в этом месяце</p>
        )}
      </Card>
    </div>
  )
}
