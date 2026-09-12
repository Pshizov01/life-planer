import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { SPHERES, SETTINGS_SPHERE } from '../lib/spheres'

function NavItem({ sphere, isActive }) {
  const Icon = sphere.icon
  return (
    <Link
      to={sphere.to}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
        isActive ? `bg-neutral-100 ${sphere.color}` : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      {sphere.label}
    </Link>
  )
}

export function Sidebar() {
  const { session } = useAuth()
  const location = useLocation()
  if (!session) return null

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-56 flex-col border-r border-neutral-200 bg-white p-4 lg:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">
          LP
        </span>
        <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
          Life Planner
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {SPHERES.map((sphere) => (
          <NavItem
            key={sphere.to}
            sphere={sphere}
            isActive={sphere.to === '/' ? location.pathname === '/' : location.pathname.startsWith(sphere.to)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-neutral-200 pt-3">
        <NavItem sphere={SETTINGS_SPHERE} isActive={location.pathname === SETTINGS_SPHERE.to} />
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  )
}
