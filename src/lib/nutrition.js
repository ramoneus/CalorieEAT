export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Καθιστική', hint: 'Λίγη ή καθόλου άσκηση', factor: 1.2 },
  { id: 'light', label: 'Ελαφριά', hint: 'Άσκηση 1–3 μέρες την εβδομάδα', factor: 1.375 },
  { id: 'moderate', label: 'Μέτρια', hint: 'Άσκηση 3–5 μέρες την εβδομάδα', factor: 1.55 },
  { id: 'intense', label: 'Έντονη', hint: 'Έντονη άσκηση 6–7 μέρες την εβδομάδα', factor: 1.725 },
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
