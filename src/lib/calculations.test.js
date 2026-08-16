import { describe, it, expect } from 'vitest'
import { habitStreak } from './calculations.js'

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
