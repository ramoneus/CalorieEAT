import { useState } from 'react'
import Field, { inputClass } from './Field'

const EMPTY = { name: '', calories: '', protein: '', carbs: '', fat: '' }

// Manual entry, for anything the food list doesn't have.
export default function MealForm({ initialName = '', onAdd, onBack }) {
  const [form, setForm] = useState({ ...EMPTY, name: initialName })
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
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 mb-2 flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Πίσω
      </button>
      <h3 className="mb-3 font-semibold">Χειροκίνητη καταχώριση</h3>
      <div className="space-y-3">
        <Field label="Φαγητό">
          <input type="text" className={inputClass} value={form.name} onChange={set('name')} placeholder="π.χ. Κοτόπουλο με ρύζι" required maxLength={80} />
        </Field>
        <Field label="Θερμίδες" unit="kcal">
          <input {...num} value={form.calories} onChange={set('calories')} placeholder="0" required />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Πρωτεΐνη" unit="g">
            <input {...num} value={form.protein} onChange={set('protein')} placeholder="0" />
          </Field>
          <Field label="Υδατ." unit="g">
            <input {...num} value={form.carbs} onChange={set('carbs')} placeholder="0" />
          </Field>
          <Field label="Λιπαρά" unit="g">
            <input {...num} value={form.fat} onChange={set('fat')} placeholder="0" />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Προσθήκη
      </button>
    </form>
  )
}
