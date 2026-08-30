import { useEffect, useState } from 'react'
import { mapPrayerTimings } from '../lib/calculations'
import { transliterate, toLatinCountryName } from '../lib/transliterate'

// method=14 — расчёт по методике Духовного управления мусульман России
const ALADHAN_METHOD = 14

async function fetchTimingsByCity(city, country) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${ALADHAN_METHOD}`
  const response = await fetch(url)
  const json = await response.json()
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error('Aladhan API error')
  }
  return json.data.timings
}

// По координатам не нужен геокодер вообще — надёжнее, чем поиск по названию
// города (которое Aladhan далеко не всегда распознаёт).
async function fetchTimingsByCoords(latitude, longitude) {
  const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${ALADHAN_METHOD}`
  const response = await fetch(url)
  const json = await response.json()
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error('Aladhan API error')
  }
  return json.data.timings
}

export function usePrayerTimes(settings) {
  const [times, setTimes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const hasCoords = settings?.latitude != null && settings?.longitude != null
  const hasCity = Boolean(settings?.city && settings?.country)

  useEffect(() => {
    if (!hasCoords && !hasCity) {
      setTimes(null)
      setError(null)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      if (hasCoords) {
        try {
          const timings = await fetchTimingsByCoords(settings.latitude, settings.longitude)
          if (!cancelled) setTimes(mapPrayerTimings(timings))
        } catch {
          if (!cancelled) setError('Не удалось загрузить время намаза для этой геопозиции')
        }
        return
      }

      try {
        const timings = await fetchTimingsByCity(settings.city, settings.country)
        if (!cancelled) setTimes(mapPrayerTimings(timings))
        return
      } catch {
        // Геокодер Aladhan не всегда распознаёт название города — пробуем
        // ещё раз транслитерацией в латиницу, прежде чем сдаться.
      }

      try {
        const timings = await fetchTimingsByCity(transliterate(settings.city), toLatinCountryName(settings.country))
        if (!cancelled) setTimes(mapPrayerTimings(timings))
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить время намаза для этого города — попробуй определить местоположение автоматически')
        }
      }
    }

    load().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [hasCoords, hasCity, settings?.latitude, settings?.longitude, settings?.city, settings?.country])

  return { times, loading, error }
}
