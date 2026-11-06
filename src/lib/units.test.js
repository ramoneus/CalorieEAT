import { describe, expect, it } from 'vitest'
import { cmToFeetInches, feetInchesToCm, unitsFor } from './units'

describe('height conversion', () => {
  it('converts centimetres to feet and inches', () => {
    expect(cmToFeetInches(180)).toEqual({ ft: 5, in: 11 })
    expect(cmToFeetInches(152.4)).toEqual({ ft: 5, in: 0 })
  })

  it('carries 12 inches over into a foot instead of showing "5 ft 12 in"', () => {
    expect(cmToFeetInches(182.5)).toEqual({ ft: 6, in: 0 })
  })

  it('converts feet and inches back to centimetres', () => {
    expect(feetInchesToCm(5, 11)).toBeCloseTo(180.34)
    expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88)
  })
})

describe('unitsFor("metric")', () => {
  const u = unitsFor('metric')

  it('leaves values unchanged', () => {
    expect(u.toWeight(80)).toBe(80)
    expect(u.fromWeight(80)).toBe(80)
    expect(u.toMass(150)).toBe(150)
    expect(u.fromMass(150)).toBe(150)
  })

  it('formats with metric units', () => {
    expect(u.fmtWeight(72.5)).toBe('72.5 kg')
    expect(u.fmtRate(0.25)).toBe('0.25 kg/week')
    expect(u.fmtMass(150)).toBe('150 g')
    expect(u.fmtHeight(180)).toBe('180 cm')
  })
})

describe('unitsFor("imperial")', () => {
  const u = unitsFor('imperial')

  it('converts kilograms and pounds both ways', () => {
    expect(u.toWeight(0.45359237)).toBeCloseTo(1)
    expect(u.fromWeight(1)).toBeCloseTo(0.45359237)
  })

  it('round-trips a weight without losing precision', () => {
    expect(u.fromWeight(u.toWeight(81.3))).toBeCloseTo(81.3, 10)
  })

  it('converts grams and ounces', () => {
    expect(u.toMass(100)).toBe(3.5)
    expect(u.fromMass(1)).toBeCloseTo(28.3495)
  })

  it('formats with US units', () => {
    expect(u.fmtWeight(80)).toBe('176.4 lb')
    expect(u.fmtRate(0.45359237)).toBe('1 lb/week')
    expect(u.fmtMass(100)).toBe('3.5 oz')
    expect(u.fmtHeight(180)).toBe('5 ft 11 in')
  })
})
