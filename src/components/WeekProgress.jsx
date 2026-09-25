import { ChevronLeft, ChevronRight } from 'lucide-react'
import { goalProgress } from '../lib/calculations'
import { ProgressRing } from './ProgressRing'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`)
}

function weekdayOf(dateStr) {
  return WEEKDAYS[(toDate(dateStr).getDay() + 6) % 7]
}

function shortDate(dateStr) {
  return toDate(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function Tile({ label, value, color = 'text-neutral-900' }) {
  return (
    <div className="rounded-xl bg-neutral-50 px-3 py-2">
      <p className="text-[11px] text-neutral-500">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export function WeekProgress({ days, summary, todayStr, level, levelCurrent, levelNeeded, xp, onPrevWeek, onNextWeek }) {
  const maxTotal = Math.max(1, ...days.map((d) => d.total))
  const weekPct = goalProgress(summary.done, summary.total)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onPrevWeek} aria-label="Предыдущая неделя" className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Прогресс</p>
          <p className="text-sm text-neutral-400">
            {shortDate(days[0].date)} – {shortDate(days[6].date)}
          </p>
        </div>
        <button onClick={onNextWeek} aria-label="Следующая неделя" className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex flex-1 items-end gap-1.5">
          {days.map((d, i) => {
            const done = d.date > todayStr ? 0 : d.done
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-neutral-400">{d.total > 0 ? `${done}/${d.total}` : ''}</span>
                <div className="relative h-24 w-full max-w-9">
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-neutral-200"
                    style={{ height: `${(d.total / maxTotal) * 100}%` }}
                  />
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-fuchsia-500"
                    style={{ height: `${(done / maxTotal) * 100}%` }}
                  />
                </div>
                <span className={`text-[11px] ${d.date === todayStr ? 'font-semibold text-fuchsia-600' : 'text-neutral-500'}`}>
                  {WEEKDAYS[i]}
                </span>
              </div>
            )
          })}
        </div>
        <ProgressRing pct={weekPct} size={84} thickness={9}>
          <span className="text-base">{weekPct}%</span>
        </ProgressRing>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-fuchsia-50 px-3 py-2">
        <ProgressRing pct={goalProgress(levelCurrent, levelNeeded)} size={52} thickness={5}>
          <span className="text-base text-fuchsia-700">{level}</span>
        </ProgressRing>
        <div>
          <p className="text-sm font-semibold text-fuchsia-800">Уровень {level}</p>
          <p className="text-xs text-fuchsia-700/80">
            {levelCurrent} / {levelNeeded} XP до следующего · всего {xp} XP
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Tile label="Всего целей" value={summary.total} />
        <Tile label="Выполнено" value={summary.done} color="text-emerald-600" />
        <Tile label="Не выполнено" value={summary.missed} color="text-red-600" />
        <Tile label="Лучший день" value={summary.best ? weekdayOf(summary.best) : '—'} color="text-emerald-600" />
        <Tile label="Худший день" value={summary.worst ? weekdayOf(summary.worst) : '—'} color="text-red-600" />
        <Tile label="Средний %" value={`${summary.avgPct}%`} />
      </div>
    </div>
  )
}
