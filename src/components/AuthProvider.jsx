import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from '../lib/AuthContext'

// Внутри Telegram Web App пробует войти автоматически по подписанным данным
// Telegram — без формы. Возвращает причину неудачи (или null при успехе),
// чтобы её можно было показать на экране логина для диагностики.
async function tryTelegramAutoLogin() {
  const initData = window.Telegram?.WebApp?.initData
  if (!initData) return 'no-init-data'

  try {
    const response = await fetch('/api/telegram-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    if (!response.ok) {
      const body = await response.text()
      return `api-${response.status}: ${body.slice(0, 200)}`
    }

    const { access_token, refresh_token } = await response.json()
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    return error ? `set-session: ${error.message}` : null
  } catch (err) {
    return `network: ${err.message}`
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [telegramAuthDebug, setTelegramAuthDebug] = useState(null)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        return
      }

      const failureReason = await tryTelegramAutoLogin()
      if (failureReason) {
        setTelegramAuthDebug(failureReason)
        setSession(null)
      }
      // При успехе (failureReason === null) onAuthStateChange ниже сам выставит session.
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined, telegramAuthDebug }}>
      {children}
    </AuthContext.Provider>
  )
}
