import { daysBetween, lastDays } from './dates'

// Goal history is [{ from: 'YYYY-MM-DD', goal }] sorted by date. Each goal applies from its
// date onwards, so editing the profile never changes how past days are judged.
export function entryFor(goals, date) {
  let entry = goals[0]
  for (const g of goals) {
    if (g.from > date) break
    entry = g
  }
  return entry
}

export const goalFor = (goals, date) => entryFor(goals, date)?.goal

// Goals saved before modes existed were plain maintenance targets.
export const modeFor = (goals, date) => entryFor(goals, date)?.mode ?? 'maintain'
export const maintenanceFor = (goals, date) => {
  const entry = entryFor(goals, date)
  return entry?.maintenance ?? entry?.goal
}

const byDate = (key) => (a, b) => a[key].localeCompare(b[key])

export const withGoal = (goals, from, goal, extra = {}) =>
  [...goals.filter((g) => g.from !== from), { from, goal, ...extra }].sort(byDate('from'))

// One weight per day; logging again on the same day replaces it.
export const withWeight = (weights, date, kg) =>
  [...weights.filter((w) => w.date !== date), { date, kg }].sort(byDate('date'))

export function caloriesByDay(meals) {
  const totals = {}
  for (const m of meals) totals[m.date] = (totals[m.date] ?? 0) + m.calories
  return totals
}

// Running surplus/deficit against maintenance, from the first logged day to today.
// Days with nothing logged add nothing, so a skipped day is not counted as a huge deficit.
export function balanceSeries(meals, goals, today) {
  const byDay = caloriesByDay(meals)
  const first = Object.keys(byDay).sort()[0]
  if (!first) return []
  let balance = 0
  return lastDays(today, daysBetween(first, today) + 1).map((date) => {
    const kcal = byDay[date] ?? null
    if (kcal) balance += kcal - maintenanceFor(goals, date)
    return { date, kcal, balance, mode: modeFor(goals, date) }
  })
}
