import { useUnits } from '../hooks/useUnits'
import { fmtVolume } from '../lib/water'

// A tumbler outline; when full, a water level fills it.
function Glass({ full }) {
  return (
    <svg viewBox="0 0 24 32" className="h-8 w-6" aria-hidden="true">
      {full && <path d="M5.6 10h12.8l-1.3 17.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8z" className="fill-sky-400 dark:fill-sky-500" />}
      <path
        d="M3 4h18l-2 23.3A2 2 0 0 1 17 29H7a2 2 0 0 1-2-1.7z"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        className={full ? 'stroke-sky-500 dark:stroke-sky-400' : 'stroke-slate-300 dark:stroke-slate-600'}
      />
    </svg>
  )
}

// Tap the next empty glass to drink one; tap a full glass to undo back to it.
export default function WaterCard({ glasses, goal, glassMl, onChange }) {
  const { imperial } = useUnits()
  const shown = Math.max(goal, glasses)
  const done = glasses >= goal

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60"
      aria-label="Water"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold">Water</h2>
        <div className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{glasses}</span> / {goal} glasses ·{' '}
          {fmtVolume(glasses * glassMl, imperial)}
          {done && <span className="ml-2 font-medium text-sky-700 dark:text-sky-300">Goal reached</span>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {Array.from({ length: shown }, (_, i) => {
          const full = i < glasses
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(full ? i : i + 1)}
              aria-label={full ? `Remove glass ${i + 1}` : `Drink glass ${i + 1}`}
              aria-pressed={full}
              className="rounded-md p-1 transition hover:bg-slate-100 active:scale-90 dark:hover:bg-slate-800"
            >
              <Glass full={full} />
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onChange(glasses + 1)}
          aria-label="Add a glass"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:hover:text-sky-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </section>
  )
}
