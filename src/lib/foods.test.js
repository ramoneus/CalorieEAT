import { describe, expect, it } from 'vitest'
import { FOOD_BY_ID, FOODS, nutrientsFor, prepareFood, searchFoods, searchKey } from './foods'

describe('searchKey', () => {
  it('ignores accents, case and doubled letters', () => {
    expect(searchKey('Crème brûlée')).toBe(searchKey('CREME BRULE'))
    expect(searchKey('Μουσακάς')).toBe(searchKey('μουσακας'))
  })
})

describe('searchFoods', () => {
  it('ranks foods whose name starts with the query first', () => {
    expect(searchFoods('feta')[0].id).toBe('feta')
    expect(searchFoods('BANANA')[0].id).toBe('banana')
  })

  it('needs every word of the query to match', () => {
    const results = searchFoods('feta honey')
    expect(results.map((f) => f.id)).toContain('feta-psiti')
    expect(results.map((f) => f.id)).not.toContain('feta')
  })

  it('also searches the hidden extra words', () => {
    expect(searchFoods('prawns').map((f) => f.id)).toContain('garides-saganaki')
  })

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchFoods('   ')).toEqual([])
    expect(searchFoods('a', 5)).toHaveLength(5)
  })

  it('includes scanned products passed in as extra foods', () => {
    const scanned = prepareFood({ id: 'off:1', name: 'Zqxy protein bar', kcal: 380, protein: 30, carbs: 35, fat: 12, portions: [] })
    expect(searchFoods('zqxy', 30, [scanned])).toEqual([scanned])
  })
})

describe('nutrientsFor', () => {
  it('scales the per-100 g values to the amount eaten', () => {
    expect(nutrientsFor(FOOD_BY_ID.feta, 200)).toEqual({ calories: 528, protein: 28, carbs: 8.2, fat: 42 })
  })
})

describe('food database', () => {
  it('has a unique id for every food', () => {
    expect(Object.keys(FOOD_BY_ID)).toHaveLength(FOODS.length)
  })

  it('has sensible values for every food', () => {
    for (const food of FOODS) {
      const where = `${food.id} (${food.name})`
      expect(food.name, where).toBeTruthy()
      for (const key of ['kcal', 'protein', 'carbs', 'fat']) {
        expect(Number.isFinite(food[key]) && food[key] >= 0, `${where}: ${key}`).toBe(true)
      }
      // Per 100 g, no macro can weigh more than 100 g and no food has more energy than pure fat.
      expect(food.protein + food.carbs + food.fat, where).toBeLessThanOrEqual(100.5)
      expect(food.kcal, where).toBeLessThanOrEqual(900)
      for (const p of food.portions) expect(p.grams > 0 && p.label, `${where}: portion`).toBeTruthy()
    }
  })
})
