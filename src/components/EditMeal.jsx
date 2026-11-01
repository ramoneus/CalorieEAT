import { useEffect, useRef, useState } from 'react'
import CategoryPicker from './CategoryPicker'
import FoodDetail from './FoodDetail'
import MealForm from './MealForm'
import { FOOD_BY_ID, prepareFood } from '../lib/foods'
import { categoryOf } from '../lib/meals'

// Edits one logged entry in a modal: the meal it belongs to and its amount (or, for a
// manual entry, its values). Uses <dialog> for focus trapping and Escape-to-close.
export default function EditMeal({ meal, products, isFavorite, onToggleFavorite, onSave, onDelete, onClose }) {
  const ref = useRef(null)
  const [category, setCategory] = useState(categoryOf(meal))
  // Built-in food or a scanned product; without either (e.g. product data cleared) it edits as a manual entry.
  const saved = products[meal.foodId]
  const food = FOOD_BY_ID[meal.foodId] ?? (saved ? prepareFood(saved) : null)

  useEffect(() => {
    ref.current.showModal()
  }, [])

  const save = (changes) => onSave({ ...changes, category })

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      aria-label={`Edit: ${meal.name}`}
    >
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit</h2>
          <button
            type="button"
            onClick={() => ref.current.close()}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <CategoryPicker value={category} onChange={setCategory} />
        </div>

        {food ? (
          <FoodDetail
            food={food}
            initial={meal}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onAdd={save}
            submitLabel="Save"
          />
        ) : (
          <MealForm initial={meal} onAdd={save} submitLabel="Save" />
        )}

        <button
          type="button"
          onClick={onDelete}
          className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          Delete
        </button>
      </div>
    </dialog>
  )
}
