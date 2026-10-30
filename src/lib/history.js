// Goal history is [{ from: 'YYYY-MM-DD', goal }] sorted by date. Each goal applies from its
// date onwards, so editing the profile never changes how past days are judged.
export function goalFor(goals, date) {
  let goal = goals[0]?.goal
  for (const g of goals) {
    if (g.from > date) break
    goal = g.goal
  }
  return goal
}

const byDate = (key) => (a, b) => a[key].localeCompare(b[key])

export const withGoal = (goals, from, goal) =>
  [...goals.filter((g) => g.from !== from), { from, goal }].sort(byDate('from'))

// One weight per day; logging again on the same day replaces it.
export const withWeight = (weights, date, kg) =>
  [...weights.filter((w) => w.date !== date), { date, kg }].sort(byDate('date'))

export function caloriesByDay(meals) {
  const totals = {}
  for (const m of meals) totals[m.date] = (totals[m.date] ?? 0) + m.calories
  return totals
}
