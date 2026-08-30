import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function useApiToken() {
  const [tokenRow, setTokenRow] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase.from('api_tokens').select('*').maybeSingle()
    setTokenRow(data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // Возвращает необработанный (не захэшированный) токен — показать
  // пользователю один раз, второй раз получить его будет уже нельзя.
  async function generateToken() {
    const token = randomToken()
    const token_hash = await sha256Hex(token)
    const { error } = tokenRow
      ? await supabase.from('api_tokens').update({ token_hash }).eq('user_id', tokenRow.user_id)
      : await supabase.from('api_tokens').insert({ token_hash })
    if (error) throw error
    await reload()
    return token
  }

  return { hasToken: Boolean(tokenRow), loading, generateToken }
}
