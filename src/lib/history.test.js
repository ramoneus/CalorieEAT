import { describe, expect, it } from 'vitest'
import { balanceSeries, caloriesByDay, goalFor, maintenanceFor, modeFor, withGoal, withWeight } from './history'

// January is an old-style entry (plain goal, no mode); from February the user is losing weight.
const goals = [
  { from: '2026-01-01', goal: 2000 },
  { from: '2026-02-01', goal: 1800, mode: 'cut', maintenance: 2300 },
]

describe('goal history lookups', () => {
  it('uses the goal that was active on each day', () => {
    expect(goalFor(goals, '2026-01-15')).toBe(2000)
    expect(goalFor(goals, '2026-02-01')).toBe(1800)
    expect(goalFor(goals, '2026-06-30')).toBe(1800)
  })

  it('uses the first goal for days before any goal was set', () => {
    expect(goalFor(goals, '2025-12-25')).toBe(2000)
  })

  it('treats old entries without a mode as maintenance', () => {
    expect(modeFor(goals, '2026-01-15')).toBe('maintain')
    expect(maintenanceFor(goals, '2026-01-15')).toBe(2000)
    expect(modeFor(goals, '2026-02-10')).toBe('cut')
    expect(maintenanceFor(goals, '2026-02-10')).toBe(2300)
  })

  it('returns undefined when there is no history yet', () => {
    expect(goalFor([], '2026-01-01')).toBeUndefined()
  })
})

describe('withGoal', () => {
  it('inserts a goal in date order', () => {
    const next = withGoal(goals, '2026-01-20', 1900)
    expect(next.map((g) => g.from)).toEqual(['2026-01-01', '2026-01-20', '2026-02-01'])
  })

  it('replaces a goal set on the same day', () => {
    const next = withGoal(goals, '2026-02-01', 1700, { mode: 'cut' })
    expect(next).toHaveLength(2)
    expect(next[1]).toEqual({ from: '2026-02-01', goal: 1700, mode: 'cut' })
  })

  it('does not change the original array', () => {
    withGoal(goals, '2026-03-01', 1600)
    expect(goals).toHaveLength(2)
  })
})

describe('withWeight', () => {
  it('keeps one weight per day, sorted by date', () => {
    let weights = []
    weights = withWeight(weights, '2026-01-03', 80)
    weights = withWeight(weights, '2026-01-01', 81)
    weights = withWeight(weights, '2026-01-03', 79.5)
    expect(weights).toEqual([
      { date: '2026-01-01', kg: 81 },
      { date: '2026-01-03', kg: 79.5 },
    ])
  })
})

describe('caloriesByDay', () => {
  it('totals calories per date', () => {
    const meals = [
      { date: '2026-01-01', calories: 500 },
      { date: '2026-01-01', calories: 700 },
      { date: '2026-01-02', calories: 300 },
    ]
    expect(caloriesByDay(meals)).toEqual({ '2026-01-01': 1200, '2026-01-02': 300 })
  })
})

describe('balanceSeries', () => {
  const flatGoal = [{ from: '2026-01-01', goal: 2000 }]

  it('is empty when nothing has been logged', () => {
    expect(balanceSeries([], flatGoal, '2026-01-10')).toEqual([])
  })

  it('keeps a running surplus/deficit against maintenance', () => {
    const meals = [
      { date: '2026-01-01', calories: 2500 },
      { date: '2026-01-03', calories: 1500 },
    ]
    expect(balanceSeries(meals, flatGoal, '2026-01-04')).toEqual([
      { date: '2026-01-01', kcal: 2500, balance: 500, mode: 'maintain' },
      // A day with nothing logged is not counted as a 2,000 kcal deficit.
      { date: '2026-01-02', kcal: null, balance: 500, mode: 'maintain' },
      { date: '2026-01-03', kcal: 1500, balance: 0, mode: 'maintain' },
      { date: '2026-01-04', kcal: null, balance: 0, mode: 'maintain' },
    ])
  })

  it('compares each day with the maintenance that applied then', () => {
    const meals = [
      { date: '2026-01-31', calories: 2000 },
      { date: '2026-02-01', calories: 1800 },
    ]
    const series = balanceSeries(meals, goals, '2026-02-01')
    expect(series.map((d) => d.balance)).toEqual([0, -500])
    expect(series.map((d) => d.mode)).toEqual(['maintain', 'cut'])
  })
})
