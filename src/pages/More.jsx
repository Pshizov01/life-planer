import { Link } from 'react-router-dom'
import { SPHERES, SETTINGS_SPHERE } from '../lib/spheres'

const secondarySpheres = SPHERES.filter((s) => !s.primary)

export default function More() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Ещё</h1>

      <div className="grid grid-cols-2 gap-3">
        {[...secondarySpheres, SETTINGS_SPHERE].map((sphere) => {
          const Icon = sphere.icon
          return (
            <Link
              key={sphere.to}
              to={sphere.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-sm font-medium text-neutral-700 hover:border-neutral-300"
            >
              <Icon className={`h-6 w-6 ${sphere.color}`} />
              {sphere.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
