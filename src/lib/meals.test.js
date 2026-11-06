import { describe, expect, it } from 'vitest'
import { amountLabel, categoryOf, defaultCategory, itemKey, recentItems, toTemplate } from './meals'

const at = (hour) => new Date(2026, 0, 1, hour)

describe('defaultCategory', () => {
  it('picks a meal from the time of day', () => {
    expect(defaultCategory(at(7))).toBe('breakfast')
    expect(defaultCategory(at(11))).toBe('lunch')
    expect(defaultCategory(at(16))).toBe('snack')
    expect(defaultCategory(at(19))).toBe('dinner')
  })
})

describe('categoryOf', () => {
  it('files old entries without a category under snacks', () => {
    expect(categoryOf({ category: 'lunch' })).toBe('lunch')
    expect(categoryOf({})).toBe('snack')
  })
})

describe('itemKey', () => {
  it('uses the food id, or the normalised name for manual entries', () => {
    expect(itemKey({ foodId: 'feta', name: 'Feta' })).toBe('feta')
    expect(itemKey({ name: '  Mum’s Pie ' })).toBe('manual:mum’s pie')
  })
})

describe('toTemplate', () => {
  it('drops the fields that belong to one entry', () => {
    const meal = { id: '1', date: '2026-01-01', createdAt: 1, category: 'lunch', name: 'Feta', calories: 132 }
    expect(toTemplate(meal)).toEqual({ name: 'Feta', calories: 132 })
  })
})

describe('recentItems', () => {
  const meals = [
    { id: 'a', name: 'Toast', createdAt: 1, date: '2026-01-01' },
    { id: 'b', foodId: 'feta', name: 'Feta', createdAt: 2, date: '2026-01-01' },
    { id: 'c', name: 'toast', createdAt: 3, date: '2026-01-02' },
    { id: 'd', foodId: 'banana', name: 'Banana', createdAt: 4, date: '2026-01-02' },
  ]

  it('lists each food once, newest first', () => {
    expect(recentItems(meals).map((m) => m.name)).toEqual(['Banana', 'toast', 'Feta'])
  })

  it('respects the limit', () => {
    expect(recentItems(meals, 2)).toHaveLength(2)
  })
})

describe('amountLabel', () => {
  it('is empty for manual entries without an amount', () => {
    expect(amountLabel({ name: 'Pie' })).toBeNull()
  })

  it('shows grams, or the portion and grams', () => {
    expect(amountLabel({ grams: 150 })).toBe('150 g')
    expect(amountLabel({ grams: 30, qty: 1, portion: 'slice' })).toBe('1 slice · 30 g')
    expect(amountLabel({ grams: 45, qty: 1.5, portion: 'slice' })).toBe('1.5 × slice · 45 g')
  })

  it('uses the formatter it is given for other units', () => {
    expect(amountLabel({ grams: 100 }, () => '3.5 oz')).toBe('3.5 oz')
  })
})
