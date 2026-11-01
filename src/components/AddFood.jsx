import { useCallback, useEffect, useMemo, useState } from 'react'
import BarcodeScanner from './BarcodeScanner'
import CategoryPicker from './CategoryPicker'
import FoodDetail from './FoodDetail'
import { inputClass } from './Field'
import MealForm from './MealForm'
import QuickList from './QuickList'
import { isStoreCode, lookupBarcode, productId } from '../lib/barcode'
import { prepareFood, searchFoods } from '../lib/foods'
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
  products,
  onSaveProduct,
}) {
  const [category, setCategory] = useState(defaultCategory)
  const [query, setQuery] = useState('')
  // 'search' | { food } | { manual: true, initial?, note? }
  const [view, setView] = useState('search')
  const [notice, setNotice] = useState(null)
  const [scanning, setScanning] = useState(false)
  // { loading: code } while looking a barcode up, { error, manual? } when it didn't work out.
  const [lookup, setLookup] = useState(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2500)
    return () => clearTimeout(t)
  }, [notice])

  const productFoods = useMemo(() => Object.values(products).map(prepareFood), [products])
  const results = useMemo(() => searchFoods(query, 30, productFoods), [query, productFoods])
  const favoriteKeys = new Set(favorites.map(itemKey))
  const isFavorite = (item) => favoriteKeys.has(itemKey(item))

  function add(item) {
    onAdd({ ...item, category })
    setNotice(`Added: ${item.name}`)
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
    setNotice(`Added ${toCopy.length} ${toCopy.length === 1 ? 'food' : 'foods'}`)
  }

  const openFood = (food) => setView({ food })

  // Scanned or typed barcode → product. Products seen before come from the local store
  // (instant, works offline); new ones are fetched from Open Food Facts and remembered.
  const handleBarcode = useCallback(
    async (code) => {
      setScanning(false)
      setQuery('')
      if (isStoreCode(code)) {
        setLookup({ error: 'This is a shop’s own barcode (for weighed fresh food), so it isn’t in any product database. Search for the food instead.' })
        return
      }
      const saved = products[productId(code)]
      if (saved) {
        setLookup(null)
        openFood(prepareFood(saved))
        return
      }
      if (!navigator.onLine) {
        setLookup({ error: 'You’re offline. Products you’ve scanned before still work; new ones need a connection.' })
        return
      }
      setLookup({ loading: code })
      try {
        const food = await lookupBarcode(code)
        if (!food) {
          setLookup({ error: `No product found for ${code}.`, manual: true })
        } else if (!food.complete) {
          setLookup(null)
          setView({
            manual: true,
            initial: { name: food.name },
            note: `Found “${food.name}”, but it has no calorie information. Enter the values from the label.`,
          })
        } else {
          setLookup(null)
          onSaveProduct(food)
          openFood(prepareFood(food))
        }
      } catch {
        setLookup({ error: 'Couldn’t reach Open Food Facts. Check your connection and try again.' })
      }
    },
    [products, onSaveProduct],
  )
  const linkBtn =
    'text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400'

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      aria-label="Add food"
    >
      <h2 className="mb-3 text-lg font-semibold">Add food</h2>

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
        <>
          {view.note && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">{view.note}</p>}
          <MealForm initial={view.initial ?? { name: query }} onAdd={add} onBack={() => setView('search')} />
        </>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="search"
              className={inputClass}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setLookup(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) openFood(results[0])
              }}
              placeholder="Search, e.g. bread, yogurt"
              aria-label="Search foods"
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Scan a barcode"
              title="Scan a barcode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8" />
              </svg>
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>

          {lookup && (
            <div
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                lookup.loading
                  ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
              }`}
              role="status"
            >
              {lookup.loading ? `Looking up ${lookup.loading}…` : lookup.error}
              {lookup.manual && (
                <>
                  {' '}
                  <button type="button" onClick={() => setView({ manual: true, initial: {} })} className={linkBtn}>
                    Enter it manually
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-3">
            {query.trim() ? (
              results.length > 0 ? (
                <ul aria-label="Results">
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
                  No results for “{query.trim()}”.{' '}
                  <button type="button" onClick={() => setView({ manual: true })} className={linkBtn}>
                    Enter it manually
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
                        Same {categoryLabel.toLowerCase()} as {previousLabel}
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
                  title="Favorites"
                  items={favorites}
                  onAdd={add}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
                <QuickList
                  title="Recent"
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
                Manual entry
              </button>
            </div>
          )}
        </>
      )}

      {scanning && <BarcodeScanner onDetected={handleBarcode} onClose={() => setScanning(false)} />}

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
