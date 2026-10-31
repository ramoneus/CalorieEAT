import { useState } from 'react'
import Field, { BackButton, inputClass } from './Field'
import { StarButton } from './QuickList'
import { useUnits } from '../hooks/useUnits'
import { nutrientsFor } from '../lib/foods'
import { fmtNumber } from '../lib/meals'

// The "by weight" choice in the unit menu: grams or ounces, depending on the user's units.
const BY_WEIGHT = 'weight'

export default function FoodDetail({ food, initial, isFavorite, onToggleFavorite, onAdd, onBack, submitLabel = 'Add' }) {
  const { imperial, toMass, fromMass, fmtMass } = useUnits()
  // A saved portion that no longer exists in the food list falls back to weight.
  const initialPortion = initial?.portion && food.portions.some((p) => p.label === initial.portion) ? initial.portion : null
  const [unit, setUnit] = useState(initial ? (initialPortion ?? BY_WEIGHT) : (food.portions[0]?.label ?? BY_WEIGHT))
  const [amount, setAmount] = useState(
    String(initial ? (initialPortion ? initial.qty : toMass(initial.grams)) : food.portions.length ? 1 : toMass(100)),
  )

  const portion = food.portions.find((p) => p.label === unit)
  const n = Number(amount)
  const grams = Math.round(portion ? portion.grams * n : fromMass(n))
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
    // Switching to weight keeps the same amount of food; switching to a portion starts at one.
    setAmount(next === BY_WEIGHT ? String(toMass(valid ? grams : 100)) : '1')
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
            Per 100 g: {food.kcal} kcal · P {fmtNumber(food.protein)} g · C {fmtNumber(food.carbs)} g · F {fmtNumber(food.fat)} g
          </p>
        </div>
        <StarButton active={isFavorite(item)} onClick={() => onToggleFavorite(item)} name={food.name} />
      </div>

      <div className="mt-4 grid grid-cols-[6rem_1fr] gap-3">
        <Field label="Amount">
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
        <Field label="Unit">
          <select className={inputClass} value={unit} onChange={changeUnit}>
            {food.portions.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({fmtMass(p.grams)})
              </option>
            ))}
            <option value={BY_WEIGHT}>{imperial ? 'ounces' : 'grams'}</option>
          </select>
        </Field>
      </div>

      <div className="mt-4 rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60" aria-live="polite">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">{valid ? fmtMass(grams) : '—'}</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {item.calories} <span className="text-sm font-medium">kcal</span>
          </span>
        </div>
        <div className="mt-1 flex gap-3 text-xs">
          <span className="text-protein">Protein {fmtNumber(item.protein)} g</span>
          <span className="text-carbs">Carbs {fmtNumber(item.carbs)} g</span>
          <span className="text-fat">Fat {fmtNumber(item.fat)} g</span>
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
