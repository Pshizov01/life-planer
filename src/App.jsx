import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
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
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-neutral-800 px-4 py-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
              isActive ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sport" element={<Sport />} />
          <Route path="/study" element={<Study />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
