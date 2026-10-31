export const MEAL_CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
]

// A sensible default for when the user opens the app; they can always switch.
export function defaultCategory(date = new Date()) {
  const h = date.getHours()
  if (h < 11) return 'breakfast'
  if (h < 16) return 'lunch'
  if (h < 19) return 'snack'
  return 'dinner'
}

// Meals logged before categories existed have none; file them under snacks.
export const categoryOf = (meal) => meal.category ?? 'snack'

// Identifies "the same food" across entries, for recents and favourites.
export const itemKey = (item) => item.foodId ?? `manual:${item.name.trim().toLowerCase()}`

// What gets re-added on a one-tap add: everything except the per-entry fields.
export function toTemplate({ id: _id, date: _date, createdAt: _createdAt, category: _category, ...rest }) {
  return rest
}

export function recentItems(meals, limit = 8) {
  const seen = new Set()
  const out = []
  for (const meal of [...meals].sort((a, b) => b.createdAt - a.createdAt)) {
    const key = itemKey(meal)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(toTemplate(meal))
    if (out.length === limit) break
  }
  return out
}

export const fmtNumber = (n) => n.toLocaleString('en-GB', { maximumFractionDigits: 1 })

export function amountLabel(item) {
  if (!item.grams) return null
  if (!item.portion) return `${fmtNumber(item.grams)} g`
  return `${item.qty === 1 ? '1' : `${fmtNumber(item.qty)} ×`} ${item.portion} · ${fmtNumber(item.grams)} g`
}
