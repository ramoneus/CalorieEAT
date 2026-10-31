import { fmtNumber } from '../lib/meals'
import { GOAL_MODES, modeById } from '../lib/nutrition'

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'bg-protein', kcalPerGram: 4 },
  { key: 'carbs', label: 'Carbohydrates', short: 'Carbs', color: 'bg-carbs', kcalPerGram: 4 },
  { key: 'fat', label: 'Fat', color: 'bg-fat', kcalPerGram: 9 },
]

const fmt = (n) => Math.round(n).toLocaleString('en-GB')

export default function Dashboard({ goal, totals, mode, maintenance, onSetMode }) {
  const remaining = goal - totals.calories
  const over = remaining < 0
  const ratio = totals.calories / goal

  const macroKcal = MACROS.reduce((s, m) => s + totals[m.key] * m.kcalPerGram, 0)

  return (
    <section className="space-y-4" aria-label="Daily summary">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label="Goal mode">
            {GOAL_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                disabled={!onSetMode}
                onClick={() => onSetMode?.(m.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
                  mode === m.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                } ${onSetMode && mode !== m.id ? 'hover:text-slate-900 dark:hover:text-white' : ''} ${!onSetMode && mode !== m.id ? 'opacity-50' : ''}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Maintenance {fmt(maintenance)} kcal
            {modeById(mode).delta !== 0 && ` · ${modeById(mode).delta > 0 ? '+' : '−'}${Math.abs(modeById(mode).delta)}`}
          </span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Eaten</div>
            <div className="text-4xl font-bold tracking-tight sm:text-5xl">
              {fmt(totals.calories)}
              <span className="ml-1 text-base font-medium text-slate-400"> / {fmt(goal)} kcal</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 dark:text-slate-400">{over ? 'Over goal' : 'Remaining'}</div>
            <div
              className={`text-2xl font-bold sm:text-3xl ${
                over ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {fmt(Math.abs(remaining))}
              <span className="ml-1 text-sm font-medium">kcal</span>
            </div>
          </div>
        </div>

        <div
          className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.round(totals.calories)}
          aria-label="Calories eaten"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs text-slate-400">{Math.round(ratio * 100)}% of goal</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MACROS.map((m) => {
          const share = macroKcal ? Math.round(((totals[m.key] * m.kcalPerGram) / macroKcal) * 100) : 0
          return (
            <div
              key={m.key}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                <span className="sm:hidden">{m.short ?? m.label}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </div>
              <div className="mt-1 text-2xl font-bold sm:text-3xl">
                {fmtNumber(totals[m.key])}
                <span className="ml-0.5 text-sm font-medium text-slate-400">g</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${share}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-400">{share}% of calories</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
