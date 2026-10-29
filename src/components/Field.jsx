export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ' +
  'dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500'

export default function Field({ label, unit, children }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
      </span>
      {children}
    </label>
  )
}
