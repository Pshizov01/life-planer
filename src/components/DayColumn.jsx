import { useState } from 'react'
import { ProgressRing } from './ProgressRing'

const MOODS = ['😞', '😕', '😐', '🙂', '😄']
const SLEEP_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12]
const MEALS_OPTIONS = [0, 1, 2, 3, 4, 5, 6]
const WATER_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`)
}

function toNumberOrNull(value) {
  return value === '' ? null : Number(value)
}

function Checkbox({ checked }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
        checked ? 'border-fuchsia-600 bg-fuchsia-600 text-white' : 'border-neutral-300 text-transparent'
      }`}
    >
      ✓
    </span>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-sm">
      <span className="text-neutral-600">{label}</span>
      {children}
    </div>
  )
}

function Select({ value, onChange, disabled, children }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(toNumberOrNull(e.target.value))}
      disabled={disabled}
      className="w-28 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs outline-none focus:border-fuchsia-500 disabled:opacity-50"
    >
      <option value="">—</option>
      {children}
    </select>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="mt-3 border-t border-neutral-200 pt-2 text-center text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </p>
  )
}

export function DayColumn({ day, review, isToday, isFuture, onToggleHabit, onToggleTask, onDeleteTask, onAddTask, onSave }) {
  const [title, setTitle] = useState('')
  const weekday = toDate(day.date).toLocaleDateString('ru-RU', { weekday: 'long' })
  const dayMonth = toDate(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAddTask(trimmed)
    setTitle('')
  }

  function saveOnBlur(field, current, parse) {
    return (e) => {
      const next = parse(e.target.value.trim())
      if (next !== (current ?? null)) onSave({ [field]: next })
    }
  }

  return (
    <div
      className={`flex w-64 shrink-0 flex-col rounded-2xl border bg-white p-3 shadow-sm ${
        isToday ? 'border-fuchsia-300 ring-1 ring-fuchsia-200' : 'border-neutral-200'
      }`}
    >
      <div className="flex items-baseline justify-between border-b border-neutral-200 pb-2">
        <p className={`font-semibold capitalize ${isToday ? 'text-fuchsia-600' : ''}`}>{weekday}</p>
        <p className="text-sm text-neutral-400">{dayMonth}</p>
      </div>

      <ul className="flex flex-col py-1">
        {day.active.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => onToggleHabit(h.id)}
              disabled={isFuture}
              className="flex w-full items-center justify-between gap-2 py-1 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={`truncate ${day.doneIds.has(h.id) ? 'text-neutral-400 line-through' : ''}`}>{h.name}</span>
              <Checkbox checked={day.doneIds.has(h.id)} />
            </button>
          </li>
        ))}
        {day.dayTasks.map((t) => (
          <li key={t.id} className="flex items-center gap-1">
            <button
              onClick={() => onToggleTask(t)}
              className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1 text-left text-sm"
            >
              <span className={`truncate ${t.done ? 'text-neutral-400 line-through' : ''}`}>{t.title}</span>
              <Checkbox checked={t.done} />
            </button>
            <button
              onClick={() => onDeleteTask(t.id)}
              aria-label="Удалить квест"
              className="shrink-0 px-1 text-xs text-neutral-300 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
        {day.total === 0 && <li className="py-1 text-sm text-neutral-400">Квестов пока нет</li>}
      </ul>

      <form onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="+ Новый квест"
          className="w-full rounded-lg border border-dashed border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-fuchsia-500"
        />
      </form>

      <div className="mt-3 border-t border-neutral-200 pt-2">
        <Row label="Выполнено">
          <span className="font-semibold">{day.done}</span>
        </Row>
        <Row label="Осталось">
          <span className="font-semibold">{day.total - day.done}</span>
        </Row>
      </div>

      <SectionTitle>Урок дня</SectionTitle>
      <input
        key={`lesson-${review?.lesson ?? ''}`}
        defaultValue={review?.lesson ?? ''}
        onBlur={saveOnBlur('lesson', review?.lesson, (v) => v || null)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        disabled={isFuture}
        placeholder="Что вынес из дня?"
        className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-fuchsia-500 disabled:opacity-50"
      />

      <SectionTitle>Состояние</SectionTitle>
      <Row label="Сон">
        <Select value={review?.sleep_hours} onChange={(v) => onSave({ sleep_hours: v })} disabled={isFuture}>
          {SLEEP_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h} ч
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Энергия">
        <Select value={review?.energy} onChange={(v) => onSave({ energy: v })} disabled={isFuture}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {'⚡'.repeat(n)}
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Настроение">
        <Select value={review?.mood} onChange={(v) => onSave({ mood: v })} disabled={isFuture}>
          {MOODS.map((emoji, i) => (
            <option key={emoji} value={i + 1}>
              {emoji}
            </option>
          ))}
        </Select>
      </Row>

      <SectionTitle>Питание</SectionTitle>
      <Row label="Вес, кг">
        <input
          key={`weight-${review?.weight_kg ?? ''}`}
          type="number"
          step="0.1"
          min="0"
          defaultValue={review?.weight_kg ?? ''}
          onBlur={saveOnBlur('weight_kg', review?.weight_kg == null ? null : Number(review.weight_kg), (v) =>
            v === '' ? null : Number(v),
          )}
          disabled={isFuture}
          placeholder="—"
          className="w-28 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs outline-none focus:border-fuchsia-500 disabled:opacity-50"
        />
      </Row>
      <Row label="Приёмы пищи">
        <Select value={review?.meals_count} onChange={(v) => onSave({ meals_count: v })} disabled={isFuture}>
          {MEALS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Вода, стаканов">
        <Select value={review?.water_glasses} onChange={(v) => onSave({ water_glasses: v })} disabled={isFuture}>
          {WATER_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </Row>

      <div className="mt-4 flex justify-center">
        <ProgressRing pct={isFuture ? 0 : day.pct} size={72} thickness={8}>
          {isFuture ? 0 : day.pct}%
        </ProgressRing>
      </div>
    </div>
  )
}
