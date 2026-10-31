import { useState } from 'react'
import Field, { BackButton, inputClass } from './Field'
import { StarButton } from './QuickList'
import { nutrientsFor } from '../lib/foods'
import { fmtNumber } from '../lib/meals'

const GRAMS = 'g'

export default function FoodDetail({ food, initial, isFavorite, onToggleFavorite, onAdd, onBack, submitLabel = 'Προσθήκη' }) {
  // A saved portion that no longer exists in the food list falls back to grams.
  const initialPortion = initial?.portion && food.portions.some((p) => p.label === initial.portion) ? initial.portion : null
  const [unit, setUnit] = useState(initial ? (initialPortion ?? GRAMS) : (food.portions[0]?.label ?? GRAMS))
  const [amount, setAmount] = useState(
    String(initial ? (initialPortion ? initial.qty : initial.grams) : food.portions.length ? 1 : 100),
  )

  const portion = food.portions.find((p) => p.label === unit)
  const n = Number(amount)
  const grams = Math.round(portion ? portion.grams * n : n)
  const valid = n > 0 && grams > 0 && grams <= 5000
  const item = {
    foodId: food.id,
    name: food.name,
    portion: portion?.label ?? null,
    qty: portion ? n : null,
    grams,
    ...nutrientsFor(food, valid ? grams : 0),
  }

  function changeUnit(e) {
    const next = e.target.value
    // Switching to grams keeps the same amount of food; switching to a portion starts at one.
    setAmount(next === GRAMS ? String(valid ? grams : 100) : '1')
    setUnit(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (valid) onAdd(item)
  }

  return (
    <form onSubmit={handleSubmit}>
      {onBack && <BackButton onClick={onBack} />}

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{food.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ανά 100 g: {food.kcal} kcal · Π {fmtNumber(food.protein)} g · Υ {fmtNumber(food.carbs)} g · Λ {fmtNumber(food.fat)} g
          </p>
        </div>
        <StarButton active={isFavorite(item)} onClick={() => onToggleFavorite(item)} name={food.name} />
      </div>

      <div className="mt-4 grid grid-cols-[6rem_1fr] gap-3">
        <Field label="Ποσότητα">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>
        <Field label="Μονάδα">
          <select className={inputClass} value={unit} onChange={changeUnit}>
            {food.portions.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({fmtNumber(p.grams)} g)
              </option>
            ))}
            <option value={GRAMS}>γραμμάρια</option>
          </select>
        </Field>
      </div>

      <div className="mt-4 rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60" aria-live="polite">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">{valid ? `${fmtNumber(grams)} g` : '—'}</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {item.calories} <span className="text-sm font-medium">kcal</span>
          </span>
        </div>
        <div className="mt-1 flex gap-3 text-xs">
          <span className="text-protein">Πρωτεΐνη {fmtNumber(item.protein)} g</span>
          <span className="text-carbs">Υδατ. {fmtNumber(item.carbs)} g</span>
          <span className="text-fat">Λιπαρά {fmtNumber(item.fat)} g</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  )
}
