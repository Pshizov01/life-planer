export function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {title && <h3 className="mb-3 text-sm font-medium text-neutral-500">{title}</h3>}
      {children}
    </div>
  )
}
