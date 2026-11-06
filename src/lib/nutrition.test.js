import { describe, expect, it } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  dailyDelta,
  daysToTarget,
  modeById,
  pickRate,
  planGoal,
  rateOptions,
  sumMacros,
  targetReached,
} from './nutrition'

const man = { sex: 'male', age: 30, weight: 80, height: 180 }
const woman = { sex: 'female', age: 25, weight: 60, height: 165 }

describe('calculateBMR (Mifflin-St Jeor)', () => {
  it('adds 5 for men', () => {
    // 10*80 + 6.25*180 - 5*30 + 5
    expect(calculateBMR(man)).toBe(1780)
  })

  it('subtracts 161 for women', () => {
    // 10*60 + 6.25*165 - 5*25 - 161
    expect(calculateBMR(woman)).toBe(1345.25)
  })
})

describe('calculateTDEE', () => {
  it('multiplies BMR by the activity factor', () => {
    expect(calculateTDEE({ ...man, activity: 'light' })).toBe(1780 * 1.375)
    expect(calculateTDEE({ ...woman, activity: 'intense' })).toBeCloseTo(1345.25 * 1.725)
  })

  it('falls back to sedentary for an unknown activity level', () => {
    expect(calculateTDEE({ ...man, activity: 'unknown' })).toBe(1780 * 1.2)
  })
})

describe('sumMacros', () => {
  it('adds up calories and macros', () => {
    const meals = [
      { calories: 300, protein: 20, carbs: 30, fat: 10 },
      { calories: 150.5, protein: 5.5, carbs: 10, fat: 8 },
    ]
    expect(sumMacros(meals)).toEqual({ calories: 450.5, protein: 25.5, carbs: 40, fat: 18 })
  })

  it('returns zeros for an empty day', () => {
    expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  })
})

describe('modeById', () => {
  it('finds a mode and defaults to maintain', () => {
    expect(modeById('cut').label).toBe('Lose')
    expect(modeById('nonsense').id).toBe('maintain')
  })
})

describe('weekly rates', () => {
  it('offers no rates while maintaining', () => {
    expect(rateOptions('maintain', 'metric')).toEqual([])
    expect(pickRate('maintain', 'metric', 0.5)).toBe(0)
  })

  it('defaults to 0.5 kg a week when losing and the gentlest rate when gaining', () => {
    expect(pickRate('cut', 'metric')).toBe(0.5)
    expect(pickRate('bulk', 'metric')).toBe(0.25)
  })

  it('defaults to 1 lb a week when losing in US units', () => {
    expect(pickRate('cut', 'imperial')).toBeCloseTo(0.45359237)
  })

  it('snaps an existing rate to the closest option', () => {
    expect(pickRate('cut', 'metric', 0.6)).toBe(0.5)
    expect(pickRate('cut', 'metric', 0.9)).toBe(1)
    // Switching from kg to lb keeps roughly the same pace: 0.5 kg ≈ 1.1 lb → 1 lb.
    expect(pickRate('cut', 'imperial', 0.5)).toBeCloseTo(0.45359237)
  })
})

describe('dailyDelta', () => {
  it('turns a weekly rate into a daily calorie change (7,700 kcal per kg)', () => {
    expect(dailyDelta('cut', 0.5)).toBe(-550)
    expect(dailyDelta('bulk', 0.25)).toBe(275)
    expect(dailyDelta('maintain', 0.5)).toBe(0)
  })
})

describe('planGoal', () => {
  it('subtracts the deficit from maintenance when losing', () => {
    expect(planGoal({ maintenance: 2500, mode: 'cut', rate: 0.5, sex: 'male' })).toEqual({ goal: 1950, limited: false })
  })

  it('adds the surplus when gaining', () => {
    expect(planGoal({ maintenance: 2500, mode: 'bulk', rate: 0.25, sex: 'male' })).toEqual({ goal: 2775, limited: false })
  })

  it('never goes below the safe minimum while losing', () => {
    expect(planGoal({ maintenance: 1800, mode: 'cut', rate: 1, sex: 'male' })).toEqual({ goal: 1500, limited: true })
    expect(planGoal({ maintenance: 1700, mode: 'cut', rate: 1, sex: 'female' })).toEqual({ goal: 1200, limited: true })
  })

  it('uses maintenance as the floor when maintenance is already under the minimum', () => {
    expect(planGoal({ maintenance: 1100, mode: 'cut', rate: 0.5, sex: 'female' })).toEqual({ goal: 1100, limited: true })
  })
})

describe('daysToTarget', () => {
  it('counts the days needed at the daily deficit', () => {
    // 5 kg * 7,700 kcal / 550 kcal a day = 70 days
    expect(daysToTarget({ current: 80, target: 75, maintenance: 2500, goal: 1950 })).toBe(70)
  })

  it('rounds up to whole days', () => {
    expect(daysToTarget({ current: 80, target: 79, maintenance: 2500, goal: 1950 })).toBe(14)
  })

  it('returns null when the goal does not move towards the target', () => {
    expect(daysToTarget({ current: 80, target: 85, maintenance: 2500, goal: 1950 })).toBeNull()
    expect(daysToTarget({ current: 80, target: 75, maintenance: 2500, goal: 2500 })).toBeNull()
    expect(daysToTarget({ current: 80, target: null, maintenance: 2500, goal: 1950 })).toBeNull()
  })
})

describe('targetReached', () => {
  it('is reached at or below the target when losing', () => {
    expect(targetReached('cut', 75, 75)).toBe(true)
    expect(targetReached('cut', 74, 75)).toBe(true)
    expect(targetReached('cut', 76, 75)).toBe(false)
  })

  it('is reached at or above the target when gaining', () => {
    expect(targetReached('bulk', 80, 80)).toBe(true)
    expect(targetReached('bulk', 79, 80)).toBe(false)
  })
})
