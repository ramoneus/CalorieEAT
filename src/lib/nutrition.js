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

// Energy in one kilogram of body weight; used for rough "what the numbers add up to" estimates.
export const KCAL_PER_KG = 7700

// The goal is maintenance (TDEE) shifted by the chosen mode.
export const GOAL_MODES = [
  { id: 'cut', label: 'Cutting', hint: 'Lose weight · 500 kcal below maintenance', delta: -500, color: '#0ea5e9' },
  { id: 'maintain', label: 'Maintaining', hint: 'Keep your weight · eat at maintenance', delta: 0, color: '#10b981' },
  { id: 'bulk', label: 'Bulking', hint: 'Gain weight · 300 kcal above maintenance', delta: 300, color: '#f59e0b' },
]

export const modeById = (id) => GOAL_MODES.find((m) => m.id === id) ?? GOAL_MODES[1]

export const goalForMode = (maintenance, modeId) => Math.round(maintenance + modeById(modeId).delta)
