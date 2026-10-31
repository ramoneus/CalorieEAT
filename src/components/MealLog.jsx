import { MEAL_CATEGORIES, amountLabel, categoryOf, fmtNumber } from '../lib/meals'

export default function MealLog({ title, meals, onEdit, onDelete }) {
  const groups = MEAL_CATEGORIES.map((c) => ({ ...c, meals: meals.filter((m) => categoryOf(m) === c.id) })).filter(
    (g) => g.meals.length > 0,
  )

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      aria-label="Γεύματα ημέρας"
    >
      <h2 className="mb-4 text-lg font-semibold first-letter:uppercase">{title}</h2>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Δεν υπάρχει καταγραφή για αυτή τη μέρα.
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.id}>
              <h3 className="flex items-baseline justify-between border-b border-slate-200 pb-1 text-sm font-semibold dark:border-slate-800">
                {group.label}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {Math.round(group.meals.reduce((s, m) => s + m.calories, 0))} kcal
                </span>
              </h3>
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {group.meals.map((meal) => (
                  <li key={meal.id} className="flex items-center gap-1 py-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(meal)}
                      aria-label={`Επεξεργασία ${meal.name}, ${Math.round(meal.calories)} θερμίδες`}
                      className="-ml-2 flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{meal.name}</span>
                        <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400">
                          {amountLabel(meal) && <span>{amountLabel(meal)}</span>}
                          <span className="text-protein">Π {fmtNumber(meal.protein)}g</span>
                          <span className="text-carbs">Υ {fmtNumber(meal.carbs)}g</span>
                          <span className="text-fat">Λ {fmtNumber(meal.fat)}g</span>
                        </span>
                      </span>
                      <span className="text-right font-semibold whitespace-nowrap">
                        {Math.round(meal.calories)} <span className="text-xs font-normal text-slate-400">kcal</span>
                      </span>
                    </button>
                    <button
                      onClick={() => onDelete(meal.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                      aria-label={`Διαγραφή ${meal.name}`}
                      title="Διαγραφή"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
