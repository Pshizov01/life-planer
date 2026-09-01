import { LayoutGrid, Landmark, Dumbbell, CheckCircle2, Utensils, BookOpen, Wallet } from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useWorkouts } from '../hooks/useWorkouts'
import { useDailyLog } from '../hooks/useDailyLog'
import { useStudy } from '../hooks/useStudy'
import { useFinance } from '../hooks/useFinance'
import { goalProgress } from '../lib/calculations'
import { PRAYER_NAMES } from '../lib/constants'
import { Card } from '../components/Card'
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

export default function Dashboard() {
  const { habits, logs: habitLogs, dates: weekDates, loading: habitsLoading } = useHabits()
  const { workouts, loading: workoutsLoading } = useWorkouts()
  const { logs: dailyLogs, loading: dailyLoading } = useDailyLog()
  const { goals: studyGoals, loading: studyLoading } = useStudy()
  const { transactions, loading: financeLoading } = useFinance()

  const loading = habitsLoading || workoutsLoading || dailyLoading || studyLoading || financeLoading
  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const last7 = daysAgo(6)

  const weekWorkouts = workouts.filter((w) => w.date >= last7)
  const weekWorkoutsMinutes = weekWorkouts.reduce((sum, w) => sum + w.duration_min, 0)

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

  const avgStudyProgress =
    studyGoals.length > 0
      ? Math.round(studyGoals.reduce((sum, g) => sum + goalProgress(g.progress, g.target), 0) / studyGoals.length)
      : null

  const thisMonth = new Date().toLocaleDateString('en-CA').slice(0, 7)
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth))
  const monthBalance = monthTx.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={LayoutGrid} color="text-neutral-700">Обзор</PageHeading>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title={<CardTitle icon={Landmark} color="text-amber-700">Намаз</CardTitle>}>
          <p className="text-2xl font-semibold">{prayers.length > 0 ? `${prayerDonePct}%` : '—'}</p>
          <p className="text-xs text-neutral-500">выполнено на этой неделе</p>
        </Card>

        <Card title={<CardTitle icon={Dumbbell} color="text-teal-600">Спорт</CardTitle>}>
          <p className="text-2xl font-semibold">{weekWorkouts.length}</p>
          <p className="text-xs text-neutral-500">тренировок за 7 дней ({weekWorkoutsMinutes} мин)</p>
        </Card>

        <Card title={<CardTitle icon={CheckCircle2} color="text-emerald-600">Привычки</CardTitle>}>
          <p className="text-2xl font-semibold">{personalHabits.length > 0 ? `${habitsDonePct}%` : '—'}</p>
          <p className="text-xs text-neutral-500">выполнено на этой неделе</p>
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

        <Card title={<CardTitle icon={BookOpen} color="text-sky-600">Учёба</CardTitle>}>
          <p className="text-2xl font-semibold">{avgStudyProgress !== null ? `${avgStudyProgress}%` : '—'}</p>
          <p className="text-xs text-neutral-500">
            {studyGoals.length > 0 ? `средний прогресс по ${studyGoals.length} целям` : 'Пока нет целей'}
          </p>
        </Card>

        <Card title={<CardTitle icon={Wallet} color="text-orange-600">Финансы</CardTitle>}>
          <p className={`text-2xl font-semibold ${monthBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {monthBalance.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-neutral-500">баланс за этот месяц</p>
        </Card>
      </div>
    </div>
  )
}
