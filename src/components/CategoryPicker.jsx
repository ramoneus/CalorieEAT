import { MEAL_CATEGORIES } from '../lib/meals'

export default function CategoryPicker({ value, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label="Γεύμα">
      {MEAL_CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          onClick={() => onChange(c.id)}
          className={`flex-auto rounded-md px-1.5 py-1.5 text-xs font-medium transition sm:text-sm ${
            value === c.id
              ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
