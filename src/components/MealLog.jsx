export default function MealLog({ meals, onDelete }) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      aria-label="Meals logged today"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Today&apos;s meals</h2>
        <span className="text-sm text-slate-400">
          {meals.length} {meals.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {meals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nothing logged yet. Add your first meal to get started.
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {meals.map((meal) => (
            <li key={meal.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{meal.name}</div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-protein">P {meal.protein}g</span>
                  <span className="text-carbs">C {meal.carbs}g</span>
                  <span className="text-fat">F {meal.fat}g</span>
                  <span>
                    {new Date(meal.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="text-right font-semibold">
                {Math.round(meal.calories)} <span className="text-xs font-normal text-slate-400">kcal</span>
              </div>
              <button
                onClick={() => onDelete(meal.id)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                aria-label={`Delete ${meal.name}`}
                title="Delete"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
