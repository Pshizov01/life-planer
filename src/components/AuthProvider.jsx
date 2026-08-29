import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../lib/AuthContext'

// Внутри Telegram Web App пробует войти автоматически по подписанным данным
// Telegram — без формы. Возвращает true, если сессию удалось установить.
async function tryTelegramAutoLogin() {
  const initData = window.Telegram?.WebApp?.initData
  if (!initData) return false

  try {
    const response = await fetch('/api/telegram-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    if (!response.ok) return false

    const { access_token, refresh_token } = await response.json()
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    return !error
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        return
      }

      const loggedInViaTelegram = await tryTelegramAutoLogin()
      if (!loggedInViaTelegram) {
        setSession(null)
      }
      // При успехе onAuthStateChange ниже сам выставит session.
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}
