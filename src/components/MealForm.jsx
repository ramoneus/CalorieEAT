import { useState } from 'react'
import Field, { inputClass } from './Field'

const EMPTY = { name: '', calories: '', protein: '', carbs: '', fat: '' }

export default function MealForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
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
    setForm(EMPTY)
  }

  const num = { type: 'number', inputMode: 'decimal', min: 0, step: 'any', className: inputClass }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
    >
      <h2 className="mb-4 text-lg font-semibold">Add a meal</h2>
      <div className="space-y-3">
        <Field label="Food">
          <input type="text" className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Chicken & rice" required maxLength={80} />
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
        Add meal
      </button>
    </form>
  )
}
