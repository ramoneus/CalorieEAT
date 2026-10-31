import { useEffect, useMemo, useState } from 'react'
import CategoryPicker from './CategoryPicker'
import FoodDetail from './FoodDetail'
import { inputClass } from './Field'
import MealForm from './MealForm'
import QuickList from './QuickList'
import { searchFoods } from '../lib/foods'
import { MEAL_CATEGORIES, categoryOf, defaultCategory, itemKey, toTemplate } from '../lib/meals'

export default function AddFood({
  recents,
  favorites,
  dayMeals,
  previousMeals,
  previousLabel,
  onAdd,
  onAddMany,
  onToggleFavorite,
}) {
  const [category, setCategory] = useState(defaultCategory)
  const [query, setQuery] = useState('')
  // 'search' | { food } | { manual: true }
  const [view, setView] = useState('search')
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2500)
    return () => clearTimeout(t)
  }, [notice])

  const results = useMemo(() => searchFoods(query), [query])
  const favoriteKeys = new Set(favorites.map(itemKey))
  const isFavorite = (item) => favoriteKeys.has(itemKey(item))

  function add(item) {
    onAdd({ ...item, category })
    setNotice(`Προστέθηκε: ${item.name}`)
    setView('search')
    setQuery('')
  }

  // Offer to repeat the previous day's meal only while this day's slot is still empty.
  const categoryLabel = MEAL_CATEGORIES.find((c) => c.id === category).label
  const toCopy = dayMeals.some((m) => categoryOf(m) === category)
    ? []
    : previousMeals.filter((m) => categoryOf(m) === category)

  function copyPrevious() {
    onAddMany(toCopy.map((m) => ({ ...toTemplate(m), category })))
    setNotice(`Προστέθηκαν ${toCopy.length} ${toCopy.length === 1 ? 'φαγητό' : 'φαγητά'}`)
  }

  const openFood = (food) => setView({ food })
  const linkBtn =
    'text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400'

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      aria-label="Προσθήκη φαγητού"
    >
      <h2 className="mb-3 text-lg font-semibold">Προσθήκη φαγητού</h2>

      <div className="mb-4">
        <CategoryPicker value={category} onChange={setCategory} />
      </div>

      {view.food ? (
        <FoodDetail
          key={view.food.id}
          food={view.food}
          initial={recents.find((r) => r.foodId === view.food.id)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onAdd={add}
          onBack={() => setView('search')}
        />
      ) : view.manual ? (
        <MealForm initial={{ name: query }} onAdd={add} onBack={() => setView('search')} />
      ) : (
        <>
          <input
            type="search"
            className={inputClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) openFood(results[0])
            }}
            placeholder="Αναζήτηση, π.χ. ψωμί, γιαούρτι"
            aria-label="Αναζήτηση φαγητού"
          />

          <div className="mt-3">
            {query.trim() ? (
              results.length > 0 ? (
                <ul aria-label="Αποτελέσματα">
                  {results.map((food) => (
                    <li key={food.id}>
                      <button
                        type="button"
                        onClick={() => openFood(food)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{food.name}</span>
                          {food.portions[0] && (
                            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                              1 {food.portions[0].label}: {Math.round((food.kcal * food.portions[0].grams) / 100)} kcal
                            </span>
                          )}
                        </span>
                        <span className="text-xs whitespace-nowrap text-slate-400">{food.kcal} kcal / 100 g</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                  Δεν βρέθηκε «{query.trim()}».{' '}
                  <button type="button" onClick={() => setView({ manual: true })} className={linkBtn}>
                    Καταχώρισέ το με το χέρι
                  </button>
                </p>
              )
            ) : (
              <div className="space-y-4">
                {toCopy.length > 0 && (
                  <button
                    type="button"
                    onClick={copyPrevious}
                    className="flex w-full items-center gap-3 rounded-lg border border-dashed border-emerald-300 px-3 py-2.5 text-left transition hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-500/10"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        Ίδιο {categoryLabel.toLowerCase()} με {previousLabel}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {toCopy.map((m) => m.name).join(', ')}
                      </span>
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {Math.round(toCopy.reduce((s, m) => s + m.calories, 0))}{' '}
                      <span className="text-xs font-normal text-slate-400">kcal</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                )}
                <QuickList
                  title="Αγαπημένα"
                  items={favorites}
                  onAdd={add}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
                <QuickList
                  title="Πρόσφατα"
                  items={recents.filter((r) => !isFavorite(r))}
                  onAdd={add}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            )}
          </div>

          {!(query.trim() && results.length === 0) && (
            <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
              <button type="button" onClick={() => setView({ manual: true })} className={linkBtn}>
                Χειροκίνητη καταχώριση
              </button>
            </div>
          )}
        </>
      )}

      <p className="sr-only" role="status">
        {notice}
      </p>
      {notice && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" aria-hidden="true">
          {notice}
        </div>
      )}
    </section>
  )
}
