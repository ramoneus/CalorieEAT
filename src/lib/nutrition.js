export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Light', hint: 'Exercise 1–3 days a week', factor: 1.375 },
  { id: 'moderate', label: 'Moderate', hint: 'Exercise 3–5 days a week', factor: 1.55 },
  { id: 'intense', label: 'Intense', hint: 'Hard exercise 6–7 days a week', factor: 1.725 },
]

// Mifflin-St Jeor: 10*kg + 6.25*cm - 5*age + 5 (men) or - 161 (women)
export function calculateBMR({ sex, age, weight, height }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(profile) {
  const level = ACTIVITY_LEVELS.find((l) => l.id === profile.activity)
  return calculateBMR(profile) * (level?.factor ?? 1.2)
}

export function sumMacros(meals) {
  return meals.reduce(
    (t, m) => ({
      calories: t.calories + m.calories,
      protein: t.protein + m.protein,
      carbs: t.carbs + m.carbs,
      fat: t.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

// Local calendar day (not UTC), so "today" rolls over at the user's midnight.
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
