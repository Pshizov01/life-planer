import { describe, it, expect } from 'vitest'
import { habitStreak, sumByWeek, goalProgress } from './calculations.js'

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
