export function PageHeading({ icon: Icon, color, children }) {
  return (
    <h1 className="flex items-center gap-2 text-2xl font-semibold">
      <Icon className={`h-6 w-6 ${color}`} />
      {children}
    </h1>
  )
}
