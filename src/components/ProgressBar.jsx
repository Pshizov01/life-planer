import { goalProgress } from '../lib/calculations'

export function ProgressBar({ value, max }) {
  const pct = goalProgress(value, max)
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {value} / {max} ({pct}%)
      </p>
    </div>
  )
}
