import { describe, it, expect } from 'vitest'
import { habitStreak, sumByWeek, goalProgress, sumByCategory, mapPrayerTimings, groupByMonth } from './calculations.js'

describe('habitStreak', () => {
  it('returns 0 for no logs', () => {
    expect(habitStreak([])).toBe(0)
  })

  it('counts every entry when all consecutive days are done', () => {
    const logs = [
      { date: '2026-08-16', done: true },
      { date: '2026-08-15', done: true },
      { date: '2026-08-14', done: true },
    ]
    expect(habitStreak(logs)).toBe(3)
  })

  it('stops counting at the first not-done day, most recent first', () => {
    const logs = [
      { date: '2026-08-16', done: true },
      { date: '2026-08-15', done: true },
      { date: '2026-08-14', done: false },
      { date: '2026-08-13', done: true },
    ]
    expect(habitStreak(logs)).toBe(2)
  })

  it('returns 0 when the most recent day is not done', () => {
    const logs = [
      { date: '2026-08-16', done: false },
      { date: '2026-08-15', done: true },
    ]
    expect(habitStreak(logs)).toBe(0)
  })
})

describe('sumByWeek', () => {
  it('returns an empty array for no entries', () => {
    expect(sumByWeek([])).toEqual([])
  })

  it('sums values within the same ISO week (Monday-Sunday) under that week\'s Monday', () => {
    const entries = [
      { date: '2026-08-10', value: 30 }, // Monday
      { date: '2026-08-14', value: 20 }, // Friday, same week
      { date: '2026-08-16', value: 10 }, // Sunday, same week
    ]
    expect(sumByWeek(entries)).toEqual([{ week: '2026-08-10', total: 60 }])
  })

  it('splits entries into separate weeks and sorts them chronologically', () => {
    const entries = [
      { date: '2026-08-17', value: 15 }, // Monday, week 2
      { date: '2026-08-09', value: 5 }, // Sunday, week 0 (Monday 08-03)
      { date: '2026-08-10', value: 30 }, // Monday, week 1
    ]
    expect(sumByWeek(entries)).toEqual([
      { week: '2026-08-03', total: 5 },
      { week: '2026-08-10', total: 30 },
      { week: '2026-08-17', total: 15 },
    ])
  })
})

describe('goalProgress', () => {
  it('returns 0 for no progress', () => {
    expect(goalProgress(0, 10)).toBe(0)
  })

  it('returns the percentage of progress toward the target', () => {
    expect(goalProgress(5, 10)).toBe(50)
  })

  it('caps at 100 when progress exceeds the target', () => {
    expect(goalProgress(15, 10)).toBe(100)
  })

  it('returns 0 when the target is 0 (avoids division by zero)', () => {
    expect(goalProgress(5, 0)).toBe(0)
  })
})

describe('sumByCategory', () => {
  it('returns an empty array for no entries', () => {
    expect(sumByCategory([])).toEqual([])
  })

  it('sums multiple entries in the same category', () => {
    const entries = [
      { category: 'Еда', amount: 20 },
      { category: 'Еда', amount: 15 },
    ]
    expect(sumByCategory(entries)).toEqual([{ category: 'Еда', total: 35 }])
  })

  it('sorts categories by total descending', () => {
    const entries = [
      { category: 'Транспорт', amount: 10 },
      { category: 'Еда', amount: 40 },
      { category: 'Развлечения', amount: 25 },
    ]
    expect(sumByCategory(entries)).toEqual([
      { category: 'Еда', total: 40 },
      { category: 'Развлечения', total: 25 },
      { category: 'Транспорт', total: 10 },
    ])
  })
})

describe('mapPrayerTimings', () => {
  it('maps Aladhan English keys to Russian prayer names', () => {
    const timings = { Fajr: '04:12', Dhuhr: '12:30', Asr: '16:45', Maghrib: '19:50', Isha: '21:20' }
    expect(mapPrayerTimings(timings)).toEqual({
      Фаджр: '04:12',
      Зухр: '12:30',
      Аср: '16:45',
      Магриб: '19:50',
      Иша: '21:20',
    })
  })

  it('strips a trailing timezone label from a timing', () => {
    const timings = { Fajr: '04:12 (MSK)', Dhuhr: '12:30', Asr: '16:45', Maghrib: '19:50', Isha: '21:20' }
    expect(mapPrayerTimings(timings).Фаджр).toBe('04:12')
  })

  it('returns null for a missing timing instead of throwing', () => {
    expect(mapPrayerTimings({}).Фаджр).toBeNull()
  })
})

describe('groupByMonth', () => {
  it('returns an empty array for no entries', () => {
    expect(groupByMonth([])).toEqual([])
  })

  it('groups entries by year-month and sorts months newest first', () => {
    const entries = [
      { date: '2026-08-20', id: 1 },
      { date: '2026-07-15', id: 2 },
      { date: '2026-08-05', id: 3 },
    ]
    expect(groupByMonth(entries)).toEqual([
      {
        month: '2026-08',
        items: [
          { date: '2026-08-20', id: 1 },
          { date: '2026-08-05', id: 3 },
        ],
      },
      { month: '2026-07', items: [{ date: '2026-07-15', id: 2 }] },
    ])
  })
})
