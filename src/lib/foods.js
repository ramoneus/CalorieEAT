import RAW_FOODS from '../data/foods'

// Folds accents, case and doubled letters onto one form,
// so "Crème brûlée", "creme brulee" and "CREME BRULE" all match each other.
export function searchKey(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/(.)\1+/g, '$1')
}

// Adds the search keys to a food. `extra` holds words that should match but aren't shown
// (synonyms, or a scanned product's original Greek name and barcode).
export const prepareFood = (food) => ({
  ...food,
  nameKey: searchKey(food.name),
  key: searchKey(`${food.name} ${food.extra ?? ''}`),
})

export const FOODS = RAW_FOODS.map(([id, name, kcal, protein, carbs, fat, portions, extra = '']) =>
  prepareFood({ id, name, kcal, protein, carbs, fat, portions: portions.map(([label, grams]) => ({ label, grams })), extra }),
)

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]))

// `extra` foods (scanned products) are searched alongside the built-in list.
export function searchFoods(query, limit = 30, extra = []) {
  const tokens = query.split(/\s+/).map(searchKey).filter(Boolean)
  if (tokens.length === 0) return []
  return [...FOODS, ...extra]
    .filter((food) => tokens.every((t) => food.key.includes(t)))
    .map((food) => ({
      food,
      rank: food.nameKey.startsWith(tokens[0]) ? 0 : food.nameKey.includes(` ${tokens[0]}`) ? 1 : 2,
    }))
    .sort((a, b) => a.rank - b.rank || a.food.name.length - b.food.name.length)
    .slice(0, limit)
    .map((r) => r.food)
}

const round1 = (n) => Math.round(n * 10) / 10

export function nutrientsFor(food, grams) {
  const f = grams / 100
  return {
    calories: Math.round(food.kcal * f),
    protein: round1(food.protein * f),
    carbs: round1(food.carbs * f),
    fat: round1(food.fat * f),
  }
}
