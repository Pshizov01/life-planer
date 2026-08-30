import { useEffect, useState } from 'react'
import { mapPrayerTimings } from '../lib/calculations'
import { transliterate, toLatinCountryName } from '../lib/transliterate'

// method=14 — расчёт по методике Духовного управления мусульман России
const ALADHAN_METHOD = 14

async function fetchTimings(city, country) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${ALADHAN_METHOD}`
  const response = await fetch(url)
  const json = await response.json()
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error('Aladhan API error')
  }
  return json.data.timings
}

export function usePrayerTimes(city, country) {
  const [times, setTimes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!city || !country) {
      setTimes(null)
      setError(null)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const timings = await fetchTimings(city, country)
        if (!cancelled) setTimes(mapPrayerTimings(timings))
        return
      } catch {
        // Геокодер Aladhan не всегда распознаёт кириллические названия —
        // пробуем ещё раз транслитерацией в латиницу, прежде чем сдаться.
      }

      try {
        const timings = await fetchTimings(transliterate(city), toLatinCountryName(country))
        if (!cancelled) setTimes(mapPrayerTimings(timings))
      } catch {
        if (!cancelled) setError('Не удалось загрузить время намаза для этого города')
      }
    }

    load().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [city, country])

  return { times, loading, error }
}
