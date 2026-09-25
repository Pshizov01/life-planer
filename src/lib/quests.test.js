import { describe, it, expect } from 'vitest'
import { levelFromXp, totalXp, dayXp, weekSummary, habitsActiveOn, dayRank } from './quests.js'

describe('levelFromXp', () => {
  it('starts at level 1 with nothing earned', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, current: 0, needed: 100 })
  })

  it('stays on level 1 just below the threshold', () => {
    expect(levelFromXp(99)).toEqual({ level: 1, current: 99, needed: 100 })
  })

  it('reaches level 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toEqual({ level: 2, current: 0, needed: 200 })
  })

  it('requires more XP for each next level', () => {
    expect(levelFromXp(250)).toEqual({ level: 2, current: 150, needed: 200 })
    expect(levelFromXp(300)).toEqual({ level: 3, current: 0, needed: 300 })
  })
})

describe('totalXp', () => {
  it('returns 0 when nothing is done', () => {
    expect(totalXp({ habitLogs: 0, tasksDone: 0, focusSessions: 0, workouts: 0, journalEntries: 0 })).toBe(0)
  })

  it('weights every kind of activity', () => {
    expect(totalXp({ habitLogs: 2, tasksDone: 1, focusSessions: 1, workouts: 1, journalEntries: 1 })).toBe(
      2 * 10 + 15 + 20 + 25 + 15,
    )
  })
})

describe('dayXp', () => {
  it('sums habit and task XP for one day', () => {
    expect(dayXp(3, 2)).toBe(3 * 10 + 2 * 15)
  })
})

describe('weekSummary', () => {
  it('returns zeros and no best/worst day for an empty week', () => {
    expect(weekSummary([])).toEqual({ total: 0, done: 0, missed: 0, avgPct: 0, best: null, worst: null })
  })

  it('ignores days that had no quests at all', () => {
    const days = [
      { date: '2026-05-11', done: 0, total: 0 },
      { date: '2026-05-12', done: 2, total: 4 },
    ]
    expect(weekSummary(days)).toEqual({
      total: 4,
      done: 2,
      missed: 2,
      avgPct: 50,
      best: '2026-05-12',
      worst: '2026-05-12',
    })
  })

  it('finds the best and worst day and averages day percentages', () => {
    const days = [
      { date: '2026-05-11', done: 1, total: 4 },
      { date: '2026-05-12', done: 4, total: 4 },
      { date: '2026-05-13', done: 1, total: 2 },
    ]
    expect(weekSummary(days)).toEqual({
      total: 10,
      done: 6,
      missed: 4,
      avgPct: 58,
      best: '2026-05-12',
      worst: '2026-05-11',
    })
  })

  it('picks the earliest day on ties', () => {
    const days = [
      { date: '2026-05-11', done: 2, total: 2 },
      { date: '2026-05-12', done: 2, total: 2 },
    ]
    const summary = weekSummary(days)
    expect(summary.best).toBe('2026-05-11')
    expect(summary.worst).toBe('2026-05-11')
  })
})

describe('habitsActiveOn', () => {
  const habits = [
    { id: 'a', created_at: '2026-05-01T12:00:00Z' },
    { id: 'b', created_at: '2026-05-12T12:00:00Z' },
    { id: 'c' },
  ]

  it('excludes habits created after the given day', () => {
    expect(habitsActiveOn(habits, '2026-05-11').map((h) => h.id)).toEqual(['a', 'c'])
  })

  it('includes a habit on the day it was created', () => {
    expect(habitsActiveOn(habits, '2026-05-12').map((h) => h.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('dayRank', () => {
  it('labels days by how many quests were completed', () => {
    expect(dayRank(0)).toBe('Квесты ждут')
    expect(dayRank(30)).toBe('Разминка')
    expect(dayRank(60)).toBe('Хороший темп')
    expect(dayRank(90)).toBe('Почти идеально')
    expect(dayRank(100)).toBe('Идеальный день')
  })
})
