export function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      {title && <h3 className="mb-3 text-sm font-medium text-neutral-400">{title}</h3>}
      {children}
    </div>
  )
}
