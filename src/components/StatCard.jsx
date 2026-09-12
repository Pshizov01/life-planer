export function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {sub && <p className={`mt-1 text-xs ${subColor ?? 'text-neutral-500'}`}>{sub}</p>}
    </div>
  )
}
