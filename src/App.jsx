import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { AuthProvider } from './components/AuthProvider.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'
import { SPHERES } from './lib/spheres.js'
import Dashboard from './pages/Dashboard.jsx'
import Sport from './pages/Sport.jsx'
import Study from './pages/Study.jsx'
import Habits from './pages/Habits.jsx'
import Prayers from './pages/Prayers.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Finance from './pages/Finance.jsx'
import Focus from './pages/Focus.jsx'
import Projects from './pages/Projects.jsx'
import Settings from './pages/Settings.jsx'
import More from './pages/More.jsx'
import Login from './pages/Login.jsx'

const primarySpheres = SPHERES.filter((s) => s.primary)

function BottomNav() {
  const { session } = useAuth()
  if (!session) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {primarySpheres.map((sphere) => {
        const Icon = sphere.icon
        return (
          <NavLink
            key={sphere.to}
            to={sphere.to}
            end={sphere.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? sphere.color : 'text-neutral-400'}`
            }
          >
            <Icon className="h-5 w-5" />
            {sphere.label}
          </NavLink>
        )
      })}
      <NavLink
        to="/more"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-neutral-700' : 'text-neutral-400'}`
        }
      >
        <MoreHorizontal className="h-5 w-5" />
        Ещё
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main className="mx-auto max-w-2xl p-4 pb-24">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/prayers" element={<ProtectedRoute><Prayers /></ProtectedRoute>} />
            <Route path="/sport" element={<ProtectedRoute><Sport /></ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><Focus /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
          </Routes>
        </main>
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  )
}
