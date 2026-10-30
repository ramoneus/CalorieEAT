import RAW_FOODS from '../data/foods'

const GREEK_TO_LATIN = {
  α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm',
  ν: 'n', ξ: 'ks', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'i', φ: 'f', χ: 'h', ψ: 'ps', ω: 'o',
}

// Folds accents, case and common Greeklish spellings onto one form,
// so "Κοτόπουλο", "κοτοπουλο" and "kotopoulo" all match each other.
export function searchKey(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/αυ/g, 'αβ')
    .replace(/ευ/g, 'εβ')
    .replace(/ου/g, 'u')
    .replace(/μπ/g, 'b')
    .replace(/ντ/g, 'd')
    .replace(/γκ|γγ/g, 'g')
    .replace(/[α-ω]/g, (c) => GREEK_TO_LATIN[c] ?? c)
    .replace(/ch|x/g, 'h')
    .replace(/ou/g, 'u')
    .replace(/mp/g, 'b')
    .replace(/nt/g, 'd')
    .replace(/8/g, 'th')
    .replace(/y/g, 'i')
    .replace(/w/g, 'o')
    .replace(/ei|oi/g, 'i')
    .replace(/ai/g, 'e')
    .replace(/(.)\1+/g, '$1')
}

export const FOODS = RAW_FOODS.map(([id, name, kcal, protein, carbs, fat, portions, extra = '']) => ({
  id,
  name,
  kcal,
  protein,
  carbs,
  fat,
  portions: portions.map(([label, grams]) => ({ label, grams })),
  nameKey: searchKey(name),
  key: searchKey(`${name} ${extra}`),
}))

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]))

export function searchFoods(query, limit = 30) {
  const tokens = query.split(/\s+/).map(searchKey).filter(Boolean)
  if (tokens.length === 0) return []
  return FOODS.filter((food) => tokens.every((t) => food.key.includes(t)))
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
