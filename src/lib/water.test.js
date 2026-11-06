import { describe, expect, it } from 'vitest'
import { fmtVolume, pickGlass, waterSettings, withWater } from './water'

describe('pickGlass', () => {
  it('defaults to 250 ml, or 8 fl oz in US units', () => {
    expect(pickGlass('metric')).toBe(250)
    expect(pickGlass('imperial')).toBe(237)
  })

  it('snaps to the closest glass size offered', () => {
    expect(pickGlass('metric', 300)).toBe(330)
    expect(pickGlass('imperial', 250)).toBe(237)
  })
})

describe('waterSettings', () => {
  it('fills in defaults for a profile without water settings', () => {
    expect(waterSettings(undefined)).toEqual({ enabled: true, goal: 8, glassMl: 250 })
  })

  it('keeps saved settings', () => {
    const profile = { units: 'metric', water: { enabled: false, goal: 10, glassMl: 200 } }
    expect(waterSettings(profile)).toEqual({ enabled: false, goal: 10, glassMl: 200 })
  })
})

describe('fmtVolume', () => {
  it('shows millilitres, litres or fluid ounces', () => {
    expect(fmtVolume(500, false)).toBe('500 ml')
    expect(fmtVolume(1500, false)).toBe('1.5 L')
    expect(fmtVolume(237, true)).toBe('8 fl oz')
  })
})

describe('withWater', () => {
  it('sets the glass count for a day without changing the original', () => {
    const water = { '2026-01-01': 3 }
    expect(withWater(water, '2026-01-02', 5)).toEqual({ '2026-01-01': 3, '2026-01-02': 5 })
    expect(water).toEqual({ '2026-01-01': 3 })
  })

  it('removes the day when the count drops to zero', () => {
    expect(withWater({ '2026-01-01': 1 }, '2026-01-01', 0)).toEqual({})
  })
})
