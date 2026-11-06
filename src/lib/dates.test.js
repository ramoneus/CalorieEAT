import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, lastDays, todayKey } from './dates'

describe('todayKey', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(todayKey(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31')
  })
})

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('handles leap years', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('daysBetween', () => {
  it('counts whole days, including across a daylight-saving change', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0)
    expect(daysBetween('2026-10-20', '2026-10-30')).toBe(10)
    expect(daysBetween('2026-03-25', '2026-04-01')).toBe(7)
  })
})

describe('lastDays', () => {
  it('returns the n days ending on the given day, oldest first', () => {
    expect(lastDays('2026-01-02', 3)).toEqual(['2025-12-31', '2026-01-01', '2026-01-02'])
  })
})
