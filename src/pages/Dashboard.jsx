import {
  LayoutGrid,
  Landmark,
  ListTodo,
  Dumbbell,
  CheckCircle2,
  Moon,
  Utensils,
  Wallet,
  Timer,
  FolderKanban,
} from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useDailyTasks } from '../hooks/useDailyTasks'
import { useWorkouts } from '../hooks/useWorkouts'
import { useDailyLog } from '../hooks/useDailyLog'
import { useJournal } from '../hooks/useJournal'
import { useFinance } from '../hooks/useFinance'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { useProjects } from '../hooks/useProjects'
import { goalProgress, sumByCategory } from '../lib/calculations'
import { PRAYER_NAMES } from '../lib/constants'
import { today } from '../lib/dates'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { StatCard } from '../components/StatCard'
import { DonutStat } from '../components/DonutStat'
import { PageHeading } from '../components/PageHeading'

function CardTitle({ icon: Icon, color, children }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      {children}
    </span>
  )
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

function todayLabel() {
  const label = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function Dashboard() {
  const { habits, logs: habitLogs, dates: weekDates, loading: habitsLoading } = useHabits()
  const { tasks, loading: tasksLoading } = useDailyTasks()
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const { logs: dailyLogs, loading: dailyLoading } = useDailyLog()
  const { entries: journalEntries, loading: journalLoading } = useJournal()
  const { transactions, loading: financeLoading } = useFinance()
  const { sessions: focusSessions, loading: focusLoading } = useFocusSessions()
  const { projects, tasks: projectTasks, loading: projectsLoading } = useProjects()

  const loading =
    habitsLoading ||
    tasksLoading ||
    workoutsLoading ||
    dailyLoading ||
    journalLoading ||
    financeLoading ||
    focusLoading ||
    projectsLoading
  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const last7 = daysAgo(6)
  const todayStr = today()

  const weekWorkouts = workouts.filter((w) => w.date >= last7)
  const weekWorkoutsMinutes = weekWorkouts.reduce((sum, w) => sum + w.duration_min, 0)

  const weekFocusSessions = focusSessions.filter((s) => s.date >= last7)
  const weekFocusMinutes = weekFocusSessions.reduce((sum, s) => sum + s.duration_min, 0)

  const prayers = habits.filter((h) => PRAYER_NAMES.includes(h.name))
  const prayerIds = new Set(prayers.map((h) => h.id))
  const prayerDonePct = goalProgress(
    habitLogs.filter((l) => prayerIds.has(l.habit_id)).length,
    prayers.length * weekDates.length,
  )

  const personalHabits = habits.filter((h) => !PRAYER_NAMES.includes(h.name))
  const personalIds = new Set(personalHabits.map((h) => h.id))
  const habitsDonePct = goalProgress(
    habitLogs.filter((l) => personalIds.has(l.habit_id)).length,
    personalHabits.length * weekDates.length,
  )

  const lastDaily = dailyLogs[dailyLogs.length - 1]

  const todayTasks = tasks.filter((t) => t.date === todayStr)
  const todayTasksDone = todayTasks.filter((t) => t.done).length

  const todayJournaled = journalEntries.some((e) => e.date === todayStr)

  const thisMonth = new Date().toLocaleDateString('en-CA').slice(0, 7)
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth))
  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const monthBalance = monthIncome - monthExpense
  const byCategory = sumByCategory(
    monthTx.filter((t) => t.type === 'expense').map((t) => ({ category: t.category, amount: t.amount })),
  )

  const projectTasksDone = projectTasks.filter((t) => t.done).length
  const projectTasksTotal = projectTasks.length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeading icon={LayoutGrid} color="text-neutral-700">Обзор</PageHeading>
        <p className="mt-1 text-sm text-neutral-500">{todayLabel()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListTodo}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Задачи сегодня"
          value={todayTasks.length > 0 ? `${todayTasksDone}/${todayTasks.length}` : '—'}
          sub={todayTasks.length > 0 ? 'выполнено сегодня' : 'задач пока нет'}
        />
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
          value={weekFocusSessions.length}
          sub={`${weekFocusMinutes} мин`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DonutStat
          icon={Landmark}
          iconColor="text-amber-700"
          color="#b45309"
          pct={prayers.length > 0 ? prayerDonePct : 0}
          label="Намаз за неделю"
          sub={prayers.length > 0 ? `${prayerDonePct}% от плана недели` : 'намазы ещё не настроены'}
        />
        <DonutStat
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          color="#059669"
          pct={personalHabits.length > 0 ? habitsDonePct : 0}
          label="Привычки за неделю"
          sub={personalHabits.length > 0 ? `${habitsDonePct}% от плана недели` : 'привычек пока нет'}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title={<CardTitle icon={FolderKanban} color="text-indigo-600">Проекты</CardTitle>}>
          <p className="text-2xl font-semibold">
            {projectTasksTotal > 0 ? `${projectTasksDone}/${projectTasksTotal}` : '—'}
          </p>
          <p className="text-xs text-neutral-500">
            {projects.length} {projects.length === 1 ? 'проект' : 'проектов'}, задач выполнено
          </p>
        </Card>

        <Card title={<CardTitle icon={Utensils} color="text-cyan-600">Питание / Сон</CardTitle>}>
          {lastDaily ? (
            <>
              <p className="text-2xl font-semibold">
                {lastDaily.weight_kg ?? '—'} кг / {lastDaily.sleep_hours ?? '—'} ч
              </p>
              <p className="text-xs text-neutral-500">последняя запись, {lastDaily.date}</p>
            </>
          ) : (
            <p className="text-sm text-neutral-500">Пока нет записей</p>
          )}
        </Card>

        <Card title={<CardTitle icon={Moon} color="text-purple-700">Дневник</CardTitle>}>
          <p className="text-2xl font-semibold">{todayJournaled ? 'Записано' : '—'}</p>
          <p className="text-xs text-neutral-500">
            {todayJournaled ? 'запись за сегодня есть' : 'сегодня ещё не писал'}
          </p>
        </Card>
      </div>

      {todayTasks.length > 0 && (
        <Card title="Задачи на сегодня">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {todayTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className={t.done ? 'text-neutral-400 line-through' : ''}>{t.title}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {t.done ? 'Выполнено' : 'В процессе'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
