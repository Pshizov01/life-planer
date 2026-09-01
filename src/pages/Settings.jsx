import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { usePrayerSettings } from '../hooks/usePrayerSettings'
import { LocationSettings } from '../components/LocationSettings'
import { QuickAddToken } from '../components/QuickAddToken'
import { DataExport } from '../components/DataExport'
import { Card } from '../components/Card'

export default function Settings() {
  const { settings, loading, saveLocation } = usePrayerSettings()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Настройки</h1>

      {!loading && <LocationSettings settings={settings} onSave={saveLocation} />}

      <QuickAddToken />

      <DataExport />

      <Card>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 text-sm text-red-600 hover:underline"
        >
          <LogOut className="h-4 w-4" />
          Выйти из аккаунта
        </button>
      </Card>
    </div>
  )
}
