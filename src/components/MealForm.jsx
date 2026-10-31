import { useState } from 'react'
import Field, { BackButton, inputClass } from './Field'

const FIELDS = ['name', 'calories', 'protein', 'carbs', 'fat']

// Manual entry, for anything the food list doesn't have. Also edits manual entries.
export default function MealForm({ initial = {}, onAdd, onBack, submitLabel = 'Add' }) {
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((k) => [k, String(initial[k] ?? '')])))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name || form.calories === '') return
    onAdd({
      name,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    })
  }

  const num = { type: 'number', inputMode: 'decimal', min: 0, step: 'any', className: inputClass }

  return (
    <form onSubmit={handleSubmit}>
      {onBack && <BackButton onClick={onBack} />}
      {onBack && <h3 className="mb-3 font-semibold">Manual entry</h3>}
      <div className="space-y-3">
        <Field label="Food">
          <input type="text" className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Chicken with rice" required maxLength={80} />
        </Field>
        <Field label="Calories" unit="kcal">
          <input {...num} value={form.calories} onChange={set('calories')} placeholder="0" required />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Protein" unit="g">
            <input {...num} value={form.protein} onChange={set('protein')} placeholder="0" />
          </Field>
          <Field label="Carbs" unit="g">
            <input {...num} value={form.carbs} onChange={set('carbs')} placeholder="0" />
          </Field>
          <Field label="Fat" unit="g">
            <input {...num} value={form.fat} onChange={set('fat')} placeholder="0" />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        {submitLabel}
      </button>
    </form>
  )
}
