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

// The goal is maintenance (TDEE) shifted by a weekly rate of weight change. The ids are kept
// from the earlier cutting/bulking modes so saved goal history still reads correctly.
export const GOAL_MODES = [
  { id: 'cut', label: 'Lose', status: 'Losing weight', sign: -1, color: '#0ea5e9' },
  { id: 'maintain', label: 'Maintain', status: 'Maintaining weight', sign: 0, color: '#10b981' },
  { id: 'bulk', label: 'Gain', status: 'Gaining weight', sign: 1, color: '#f59e0b' },
]

export const modeById = (id) => GOAL_MODES.find((m) => m.id === id) ?? GOAL_MODES[1]

const KG_PER_LB = 0.45359237

// Weekly rates on offer, stored in kg but in round steps of the user's unit.
const RATES = {
  metric: { cut: [0.25, 0.5, 0.75, 1], bulk: [0.25, 0.5] },
  imperial: { cut: [0.5, 1, 1.5, 2].map((lb) => lb * KG_PER_LB), bulk: [0.5, 1].map((lb) => lb * KG_PER_LB) },
}

export const rateOptions = (modeId, units) => RATES[units === 'imperial' ? 'imperial' : 'metric'][modeId] ?? []

// The offered rate closest to `rate` (e.g. after switching units or mode). With no rate yet,
// losing defaults to 0.5 kg (1 lb) a week and gaining to the gentlest option.
export function pickRate(modeId, units, rate) {
  const options = rateOptions(modeId, units)
  if (!options.length) return 0
  if (!rate) return options[modeId === 'cut' ? 1 : 0]
  return options.reduce((best, r) => (Math.abs(r - rate) < Math.abs(best - rate) ? r : best))
}

export const dailyDelta = (modeId, rate) => (modeById(modeId).sign * rate * KCAL_PER_KG) / 7

// Lowest daily goal suggested while losing weight without medical supervision.
export const MIN_GOAL = { female: 1200, male: 1500 }

// The daily goal for a plan. A losing goal is never pushed below MIN_GOAL (or below maintenance
// itself, for the rare person whose maintenance is already under it); `limited` says so.
export function planGoal({ maintenance, mode, rate, sex }) {
  const raw = Math.round(maintenance + dailyDelta(mode, rate))
  if (modeById(mode).sign >= 0) return { goal: raw, limited: false }
  const floor = Math.min(maintenance, MIN_GOAL[sex] ?? MIN_GOAL.female)
  return { goal: Math.max(raw, floor), limited: raw < floor }
}

// Whole days until `target` (kg) at the goal's actual daily surplus or deficit; null when the
// goal doesn't move towards it.
export function daysToTarget({ current, target, maintenance, goal }) {
  const delta = goal - maintenance
  const toGo = target - current
  if (!target || !delta || Math.sign(delta) !== Math.sign(toGo)) return null
  return Math.ceil((toGo * KCAL_PER_KG) / delta)
}

// Whether `current` has reached a target set while losing (at or below) or gaining (at or above).
export const targetReached = (modeId, current, target) =>
  modeById(modeId).sign < 0 ? current <= target : current >= target
