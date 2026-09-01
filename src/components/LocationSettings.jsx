import { useEffect, useState } from 'react'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from './Card'

export function LocationSettings({ settings, onSave }) {
  const [city, setCity] = useState(settings?.city ?? '')
  const [country, setCountry] = useState(settings?.country ?? '')
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    setCity(settings?.city ?? '')
    setCountry(settings?.country ?? '')
  }, [settings])

  const usingCoords = settings?.latitude != null && settings?.longitude != null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!city.trim() || !country.trim()) return
    try {
      await onSave({ city: city.trim(), country: country.trim() })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается этим браузером')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await onSave({ latitude: position.coords.latitude, longitude: position.coords.longitude })
          setError(null)
        } catch {
          setError(GENERIC_ERROR)
        } finally {
          setLocating(false)
        }
      },
      () => {
        setError('Не удалось определить местоположение — проверь разрешение на геолокацию')
        setLocating(false)
      },
    )
  }

  return (
    <Card title="Местоположение для расчёта времени намаза">
      {usingCoords && (
        <p className="mb-2 text-xs text-neutral-500">Сейчас используется геолокация (самый надёжный вариант).</p>
      )}

      <button
        onClick={handleUseLocation}
        disabled={locating}
        className="mb-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {locating ? 'Определяем…' : 'Определить моё местоположение'}
      </button>

      <p className="mb-2 text-xs text-neutral-500">Или укажи город вручную:</p>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Город"
          className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Страна"
          className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
        >
          Сохранить
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}
