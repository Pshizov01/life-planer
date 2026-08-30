import { useEffect, useState } from 'react'
import { mapPrayerTimings } from '../lib/calculations'

// method=14 — расчёт по методике Духовного управления мусульман России
const ALADHAN_METHOD = 14

export function usePrayerTimes(city, country) {
  const [times, setTimes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!city || !country) {
      setTimes(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${ALADHAN_METHOD}`

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.code !== 200 || !json.data?.timings) {
          throw new Error('bad response')
        }
        setTimes(mapPrayerTimings(json.data.timings))
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить время намаза для этого города')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [city, country])

  return { times, loading, error }
}
