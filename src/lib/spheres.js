import {
  LayoutGrid,
  Landmark,
  Dumbbell,
  BookOpen,
  CheckCircle2,
  ListTodo,
  Utensils,
  Wallet,
  Timer,
  FolderKanban,
  Settings as SettingsIcon,
} from 'lucide-react'

// Единый реестр разделов: путь, подпись, иконка, акцентный цвет.
// Классы цвета — литеральные строки (не собираются динамически), чтобы
// Tailwind точно включил их в сборку.
export const SPHERES = [
  { to: '/', label: 'Обзор', icon: LayoutGrid, color: 'text-neutral-700', primary: true },
  { to: '/prayers', label: 'Намаз', icon: Landmark, color: 'text-amber-700', primary: true },
  { to: '/tasks', label: 'Задачи', icon: ListTodo, color: 'text-rose-600', primary: true },
  { to: '/habits', label: 'Привычки', icon: CheckCircle2, color: 'text-emerald-600', primary: true },
  { to: '/finance', label: 'Финансы', icon: Wallet, color: 'text-orange-600', primary: true },
  { to: '/sport', label: 'Спорт', icon: Dumbbell, color: 'text-teal-600' },
  { to: '/study', label: 'Учёба', icon: BookOpen, color: 'text-sky-600' },
  { to: '/nutrition', label: 'Питание/Сон', icon: Utensils, color: 'text-cyan-600' },
  { to: '/focus', label: 'Фокус', icon: Timer, color: 'text-violet-600' },
  { to: '/projects', label: 'Проекты', icon: FolderKanban, color: 'text-indigo-600' },
]

export const SETTINGS_SPHERE = { to: '/settings', label: 'Настройки', icon: SettingsIcon, color: 'text-neutral-500' }
