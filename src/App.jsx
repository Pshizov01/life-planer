import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'
import { supabase } from './lib/supabaseClient.js'
import Dashboard from './pages/Dashboard.jsx'
import Sport from './pages/Sport.jsx'
import Study from './pages/Study.jsx'
import Habits from './pages/Habits.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Finance from './pages/Finance.jsx'
import Login from './pages/Login.jsx'

const navItems = [
  { to: '/', label: 'Обзор' },
  { to: '/sport', label: 'Спорт' },
  { to: '/study', label: 'Учёба' },
  { to: '/habits', label: 'Привычки' },
  { to: '/nutrition', label: 'Питание/Сон' },
  { to: '/finance', label: 'Финансы' },
]

function Nav() {
  const { session } = useAuth()
  if (!session) return null

  return (
    <nav className="flex items-center justify-between gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-4 py-2">
      <div className="flex gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        Выйти
      </button>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <main className="p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sport" element={<ProtectedRoute><Sport /></ProtectedRoute>} />
            <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
