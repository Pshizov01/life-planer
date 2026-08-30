import { useState } from 'react'
import { useApiToken } from '../hooks/useApiToken'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from './Card'

export function QuickAddToken() {
  const { hasToken, loading, generateToken } = useApiToken()
  const [revealedToken, setRevealedToken] = useState(null)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    if (hasToken && !window.confirm('Старый токен перестанет работать. Создать новый?')) return
    try {
      const token = await generateToken()
      setRevealedToken(token)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return null

  return (
    <Card title="Быстрое добавление трат с телефона">
      <p className="text-sm text-neutral-500">
        Токен для команды (Shortcuts) на iPhone — добавляет трату голосом или одним тапом, без открытия
        приложения.
      </p>
      <button
        onClick={handleGenerate}
        className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        {hasToken ? 'Пересоздать токен' : 'Создать токен'}
      </button>

      {revealedToken && (
        <div className="mt-3 rounded-lg bg-neutral-50 p-3">
          <p className="mb-1 text-xs text-neutral-500">
            Скопируй сейчас — повторно этот токен не покажем (можно будет только пересоздать):
          </p>
          <code className="block break-all text-sm">{revealedToken}</code>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}
